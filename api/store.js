import { useRef, useState, useEffect } from 'react';

import { Photo, Like } from '@nokkio/magic';
import { stringifyQuery } from '@nokkio/data';

// TODO:
// 1. belongsTo eager relationships should be separated from the record,
//    and also should be runtime models.
// 1. Counts should be stored separately, maybe in the subscription?
// 1. What to do about hooks that return a single item, like `usePhoto(n)`

// would be created by nokkio/magic
const modelMap = {
  photos: Photo,
  likes: Like,
};

// Central bookkeeping store for records and subscriptions
const store = {
  records: {},
  recordsToSubscriptions: {},
  results: {},
  subscriptions: {},
};

// for debugging
window.__NOKKIO_STORE = store;

// The RuntimeModel would be produced by @nokkio/magic, similarly to
// how it is created now.
class RuntimeModel {
  constructor(values, model) {
    for (const [key, val] of Object.entries(values)) {
      this[key] = val;
    }

    this.__model = model;
  }

  // Mutation methods are simply fire and forget, the store handles
  // deciding what needs to get updates afterwards
  createLike() {
    const path = Like.collectionName;
    return mutation('POST', path, { photoId: this.id }).then(() => {
      markRecordAsCreated(Like, this.__model);
    });
  }

  delete() {
    const path = this.__model.collectionName + '/' + this.id;
    return mutation('DELETE', path).then(() => {
      markRecordForDelete(this.__model, this.id);
    });
  }

  update(fields) {
    const path = this.__model.collectionName + '/' + this.id;

    // TODO: optimistic update that falls back to old value if the following fails
    return mutation('PATCH', path, { fields }).then(() => {
      // todo: have patch return new record or refetch it here
      markRecordForUpdate(this.__model, fields, this.id);
    });
  }
}

// Results ultimately provided to the hooks / components would still be wrapped
// in our CollectionArray, however it is now much simpler since it doesn't need
// to know about how to reload.
class CollectionArray extends Array {
  constructor(instances, links, link) {
    if (Array.isArray(instances)) {
      super(...instances);
    } else {
      // Array subclasses are sometimes called like `new CollectionArray(0)` by
      // internal array comprehension instances methods like `map`.
      super(instances);
    }

    this.__links = links;
    this.__link = link;
  }

  hasNext() {
    return typeof this.__links.next !== 'undefined';
  }

  hasPrev() {
    return typeof this.__links.prev !== 'undefined';
  }

  next() {
    this.__link(this.__links.next);
  }

  prev() {
    this.__link(this.__links.prev);
  }
}

// After a record has been created, decide what subscriptions are potentially stale.
function markRecordAsCreated(model, scopedModel) {
  // TODO: we could use scopedModel to better decide which counts actually
  // need updating?
  Object.getOwnPropertySymbols(store.subscriptions).forEach((id) => {
    const sub = store.subscriptions[id];

    if (sub.model === model || sub.hasCountsForModel(model)) {
      sub.freshen();
    }
  });
}

// After a record has been deleted, decide what subscriptions are potentially stale.
function markRecordForDelete(model, recordId) {
  const stale = new Set();

  const subscriptions = store.recordsToSubscriptions[recordId] || new Set();

  // queries that include this item need refreshing
  for (const subscription of subscriptions) {
    stale.add(subscription);
  }

  // Also subscriptions that have a count for this model should refresh
  Object.getOwnPropertySymbols(store.subscriptions).forEach((id) => {
    const sub = store.subscriptions[id];

    if (sub.hasCountsForModel(model)) {
      stale.add(sub);
    }
  });

  for (const staleSubscription of stale) {
    staleSubscription.freshen();
  }
}

// After a record has been updated, decide what subscriptions are potentially stale.
function markRecordForUpdate(model, fields, recordId) {
  // TODO: given we know the fields that are updated, we can more surgically
  // decide what needs updating after an update.
  //
  // Conditions for a full freshen of a subcription:
  // 1. sorted by updated field
  // 2. sorted by updatedAt timestamp
  // 3. queried by one of the fields
  // 4. Has counts that are limited by updated field name
  // 4. has "with" that meet the above criteria in 1, 2, or 3

  // For now take the more general strategy that markRecordForDelete uses
  markRecordForDelete(model, recordId);
}

// Records themselves are stored in the store, the subscriptions only store
// pointers to them. This allows for structural sharing of updates later.
function storeRecord(Model, record, subscription) {
  store.records[Model.singleName] = store.records[Model.singleName] || {};
  // add a ref count to help with cleanup?
  store.records[Model.singleName][record.id] = record;

  store.recordsToSubscriptions[record.id] =
    store.recordsToSubscriptions[record.id] || new Set();

  store.recordsToSubscriptions[record.id].add(subscription);
}

// Subscriptions manage a subset of the store's data and let the subscriber
// know when that subset has potentially changed. Subscribers include @nokkio/magic
// hooks as well as other Subscriptions.
class Subscription {
  constructor(model, query, initialRecords = null) {
    this.id = Symbol('subscription');
    this.value = { isLoading: true };
    this.subscribers = {};
    this.model = model;
    this.query = query;
    this.freshenOnNextSubscribe = initialRecords === null;
    this.key = initialRecords
      ? initialRecords.links.self.replace(/^\/_\/data\//, '')
      : model.collectionName + stringifyQuery(query);
    this.relationshipSubscriptions = {};
    this.relationshipUnsubscribers = [];

    // Some subcriptions start with a know set of fresh records,
    // like relationship data.
    if (initialRecords === null) {
      this.ids = store.results[this.key] || [];
      this.links = {};

      if (this.ids.length) {
        this.hydrate();
      }
    } else {
      this.ids = [];
      initialRecords.data.forEach((r) => {
        this.ids.push(r.id);
        storeRecord(this.model, r, this);
      });
      this.links = initialRecords.links;
      this.hydrate();
    }

    store.subscriptions[this.id] = this;
  }

  hasCountsForModel(model) {
    if (this.query.withCounts) {
      if (Array.isArray(this.query.withCounts)) {
        return this.query.withCounts.includes(model.collectionName);
      }

      return Object.keys(this.query.withCounts).includes(model.collectionName);
    }

    return false;
  }

  // Used by pagination methods
  setKey(key) {
    this.key = key.replace(/^\/_\/data\//, '');
    this.freshen();
  }

  // freshen() gets the latest data for this subscription, then notifies subscribers.
  // TODO: what to do about calls to freshen() while one is already
  // in flight but not complete?
  freshen() {
    makeApiRequest(this.key).then(({ data, links, relationships = {} }) => {
      const ids = [];
      const relationshipUnsubscribers = [];
      const relationshipSubscriptions = {};

      data.forEach((r) => {
        ids.push(r.id);
        storeRecord(this.model, r, this);

        if (relationships[r.id]) {
          relationshipSubscriptions[r.id] = [];

          for (const [pluralName, result] of Object.entries(
            relationships[r.id],
          )) {
            const model = modelMap[pluralName];
            const sub = new Subscription(model, {}, result);

            relationshipUnsubscribers.push(sub.subscribe(() => this.notify()));

            relationshipSubscriptions[r.id].push(sub);
          }
        }
      });

      this.ids = ids;
      this.links = links;
      this.relationshipUnsubscribers.forEach((u) => u());
      this.relationshipUnsubscribers = relationshipUnsubscribers;
      this.relationshipSubscriptions = relationshipSubscriptions;

      // Storing the last known set of results for a key allows us to start with
      // stale data if another subscription boots up with the same key.
      // That subscription would show stale data while it is getting a fresh result.
      //
      // Turned off for now b/c hydrating just the ids without relationship data causes
      // unexpected half-hydrated data.
      // store.results[this.key] = ids;

      this.notify();
    });
  }

  hydrate() {
    // The subscription only stores its ids, we don't boot up the full records
    // until necessary.
    const nextValue = this.ids.map((id) => {
      const record = store.records[this.model.singleName][id];
      const relationshipData = {};

      if (this.relationshipSubscriptions[id]) {
        this.relationshipSubscriptions[id].forEach((sub) => {
          relationshipData[sub.model.collectionName] = sub.getCurrentValue();
        });
      }

      return new RuntimeModel({ ...record, ...relationshipData }, this.model);
    });

    this.value = new CollectionArray(nextValue, this.links, (k) =>
      this.setKey(k),
    );
  }

  notify() {
    // TODO: could move this even later in the process, perhaps when
    // getCurrentValue is called and memoize it?
    this.hydrate();

    Object.getOwnPropertySymbols(this.subscribers).forEach((s) => {
      this.subscribers[s]();
    });
  }

  getCurrentValue() {
    return this.value;
  }

  scheduleUpdate() {
    this.freshenOnNextSubscribe = true;
  }

  handleUnsubscribe(key) {
    delete this.subscribers[key];

    // If nothing else is subscribing, disconnect from other relationship subs
    if (Object.getOwnPropertySymbols(this.subscribers).length === 0) {
      this.relationshipUnsubscribers.forEach((u) => u());
      delete store.subscriptions[this.id];

      // TODO: do some GC is the store?
    }
  }

  subscribe(fn) {
    const key = Symbol('subscriber');

    this.subscribers[key] = fn;

    if (this.freshenOnNextSubscribe) {
      this.freshen();
      this.freshenOnNextSubscribe = false;
    }

    return () => this.handleUnsubscribe(key);
  }
}

// An example of what @nokkio/magic would create for a collection
const createCollectionHook = (Model) => (q) => {
  const subscription = useRef(new Subscription(Model, q));
  const [v, setV] = useState(subscription.current.getCurrentValue());

  useEffect(() => {
    let unsubscribed = false;

    const update = () => {
      if (unsubscribed) {
        return;
      }

      setV(subscription.current.getCurrentValue());
    };

    const unsub = subscription.current.subscribe(update);

    return () => {
      unsubscribed = true;
      unsub();
    };
  }, []);

  return v;
};

export const usePhotos = createCollectionHook(Photo);

// Copies of data-bindings stuff from here on out
export function mutation(method, path, payload) {
  return makeApiRequest(`${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-NOKKIO-SCHEMA-VERSION': __NOKKIO_SCHEMA_VERSION__,
    },
    body: payload,
  });
}

export function makeApiRequest(path, { body, headers, ...options } = {}) {
  if (body && typeof body !== 'string') {
    body = JSON.stringify(body);
  }

  return fetch(`/_/data/${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-NOKKIO-SCHEMA-VERSION': __NOKKIO_SCHEMA_VERSION__,
      ...headers,
    },
    body,
    ...options,
  })
    .then((r) => r.json())
    .then((r) => {
      if (r.success === false) {
        throw new Error(r.message);
      }

      return r;
    });
}
