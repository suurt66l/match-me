import EmailInputBlock from "../molecules/EmailInputBlock";
import PasswordInputBlock from "../molecules/PasswordInputBlock";
import SubmitButton from "../atoms/SubmitButton";
import ErrorParagraph from "../atoms/ErrorParagraph";
import NicknameInputBlock from "../molecules/NicknameInputBlock";

interface Props {
  setNickname: (value: string) => void;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  error: string | null;
}
export default function RegistrationSection ({ setNickname, setEmail, setPassword, onSubmit, error }: Props) {
  
  
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={onSubmit} method="POST" className="space-y-6">
            <NicknameInputBlock 
              setNickname={setNickname}
            />
            <EmailInputBlock 
              setEmail={setEmail}
            />
            <PasswordInputBlock 
              setPassword={setPassword}
              showForgotPassword ={ false }
            /> 

            {/* If error exist than display it */}
            {error ? <ErrorParagraph errorMsg={error}/> : null }

            <SubmitButton />
          </form>
        </div>
      </div>
  )
};