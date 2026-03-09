import EmailInputBlock from "../molecules/EmailInputBlock";
import PasswordInputBlock from "../molecules/PasswordInputBlock";
import SubmitButton from "../atoms/SignInButton";

interface Props {
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string | null;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
}
export default function AuthSection ({ email, setEmail, password, setPassword, error, onSubmit }: Props) {
  
  
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={onSubmit} method="POST" className="space-y-6">
            <EmailInputBlock 
                email={email}
                setEmail={setEmail}
            />
            <PasswordInputBlock 
            
            />

            <SubmitButton />
          </form>

          <p className="mt-5 text-center text-sm/6 text-gray-400">
            Not a member?{' '}
            <a href="#" className="font-semibold text-amber-800 hover:text-amber-700">
              Join us now
            </a>
          </p>
        </div>
      </div>
  )
};