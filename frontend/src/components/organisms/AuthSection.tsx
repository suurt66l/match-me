import EmailInput from "../molecules/EmailInput";
import PasswordInput from "../molecules/PasswordInput";
import SubmitButton from "../molecules/SignInButton";

export default function AuthSection () {
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form action="#" method="POST" className="space-y-6">
            <EmailInput />
            <PasswordInput />
            <SubmitButton />
          </form>

          <p className="mt-5 text-center text-sm/6 text-gray-400">
            Not a member?{' '}
            <a href="#" className="font-semibold text-indigo-400 hover:text-indigo-300">
              Join us now
            </a>
          </p>
        </div>
      </div>
  )
};