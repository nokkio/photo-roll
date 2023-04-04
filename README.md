# Photo Roll

This repo contains a simple Nokkio application that demos Nokkio's data, authentication, and image handling capabilities. A live version can be found at [photo-roll.nokk.io](https://photo-roll.nokk.io).

## Running locally

Feel free to fork this repo and try it yourself on your local machine with `nokkio dev`. We've disabled authentication in the live version, to re-enable, remove this line from `server/boot.ts`:

```ts
User.beforeCreate('RESTRICT_TO_ENDPOINTS');
```

Then, open up `pages/registrations.tsx` and remove the `disabled` property from the form elements.
