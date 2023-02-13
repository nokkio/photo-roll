import { useLoginForm } from '@nokkio/auth';
import { Link } from '@nokkio/router';
import { Input } from "@nokkio/forms";

export default function Login() {
  const { Form } = useLoginForm();

  return (
    <Form className="bg-white w-96 mx-auto p-6 space-y-8 shadow">
      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Username</label>
        <Input
          autoFocus
          type="text"
          name="username"
          placeholder="username"
          className="py-1 text-sm border-b border-indigo-100 focus:outline-none focus:border-indigo-700"
        />
      </fieldset>
      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Password</label>
        <Input
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
    </Form>
  );
}
