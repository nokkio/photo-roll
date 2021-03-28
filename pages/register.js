import React, { useState } from 'react';
import { useAuth } from '@nokkio/auth';
import { Link, useNavigate } from '@nokkio/router';
import { createUser } from '@nokkio/magic';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { username, password, avatar } = e.target.elements;

    createUser({
      username: username.value,
      password: password.value,
      avatar: avatar.files[0],
    }).then(() => {
      login(username.value, password.value).then(() => navigate('/'));
    });
  }

  return (
    <form
      className="bg-white w-96 mx-auto p-6 space-y-8 shadow"
      onSubmit={onSubmit}
    >
      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Username</label>
        <input
          type="text"
          name="username"
          placeholder="username"
          className="py-1 text-sm border-b border-indigo-100 focus:outline-none focus:border-indigo-700"
        />
      </fieldset>
      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Password</label>
        <input
          type="password"
          name="password"
          placeholder="password"
          className="py-1 text-sm border-b border-indigo-100 focus:outline-none focus:border-indigo-700"
        />
      </fieldset>

      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Avatar</label>
        <input
          type="file"
          name="avatar"
          className="py-1 text-xs focus:outline-none focus:border-indigo-700"
        />
      </fieldset>

      <button
        disabled={loading}
        className="bg-indigo-700 w-full p-3 text-indigo-50 rounded disabled:bg-gray-400"
      >
        Sign up
      </button>
    </form>
  );
}
