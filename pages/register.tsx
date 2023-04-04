import { useRegisterForm } from '@nokkio/auth';
import { Input } from '@nokkio/forms';

export default function Login() {
  const { Form } = useRegisterForm();

  return (
    <Form className="bg-white w-96 mx-auto p-6 space-y-8 shadow">
      <p className="text-sm bg-yellow-100 p-3 text-yellow-700 border-yellow-200 border">
        This is a demo application and registration is disabled. View the{' '}
        <a className="underline" href="https://github.com/nokkio/photo-roll">
          readme in the repo
        </a>{' '}
        for instructions on running this locally and re-enabling registrations.
      </p>
      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Username</label>
        <Input
          disabled
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
          disabled
          type="password"
          name="password"
          placeholder="password"
          className="py-1 text-sm border-b border-indigo-100 focus:outline-none focus:border-indigo-700"
        />
      </fieldset>

      <fieldset className="flex flex-col space-y-2">
        <label className="text-xs uppercase text-gray-500">Avatar</label>
        <Input
          disabled
          type="file"
          name="avatar"
          className="py-1 text-xs focus:outline-none focus:border-indigo-700"
        />
      </fieldset>

      <button
        disabled
        className="bg-indigo-700 w-full p-3 text-indigo-50 rounded disabled:bg-gray-400"
      >
        Sign up
      </button>
    </Form>
  );
}
