import React from 'react';
import { useAuth } from '@nokkio/auth';
import { Link, useNavigate } from '@nokkio/router';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  function onSubmit(e) {
    e.preventDefault();
    const { username, password } = e.target.elements;
    login(username.value, password.value).then(() => {
      navigate('/');
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
          autoFocus
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

      <button className="bg-indigo-700 w-full p-3 text-indigo-50 rounded">
        Sign in
      </button>

      <p className="text-sm text-center text-gray-500">
        New here?{' '}
        <Link className="underline text-indigo-700" to="/register">
          Signup for an account.
        </Link>
      </p>
    </form>
  );
}
