import EmailInputBlock from "../molecules/EmailInputBlock";
import PasswordInputBlock from "../molecules/PasswordInputBlock";
import ErrorParagraph from "../atoms/ErrorParagraph";
import { Link } from 'react-router-dom';
import SignInButton from "../atoms/SignInButton";

interface Props {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  error: string | null;
}
export default function AuthSection ({ setEmail, setPassword, onSubmit, error }: Props) {
  
  
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={onSubmit} method="POST" className="space-y-6">
            <EmailInputBlock 
              setEmail={setEmail}
            />
            <PasswordInputBlock 
              setPassword={setPassword}
              mode={"login"}
            /> 

            {/* If error exist than display it */}
            {error ? <ErrorParagraph errorMsg={error}/> : null }

            <SignInButton />
          </form>

          <p className="mt-5 text-center text-sm/6 text-gray-400">
            Not a member?{' '}
              <Link to="/registration" className="font-semibold text-amber-800 hover:text-amber-700"> Join us now </Link>
          </p>
        </div>
      </div>
  )
};