import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import EmailInputBlock from "../molecules/EmailInputBlock";
import PasswordInputBlock from "../molecules/PasswordInputBlock";
import ErrorParagraph from "../atoms/ErrorParagraph";
import NicknameInputBlock from "../molecules/NicknameInputBlock";
import ConfirmPasswordBlock from "../molecules/ConfirmPasswordBlock";
import SaveButton from "../atoms/SaveButton";

export default function AccountForm () {
  const [nickname, setNickname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("http://localhost:8080/me/profile", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setNickname(data.nickname ?? "");
          setEmail(data.email ?? "");
        }
      } catch {
        // Server unreachable — form starts empty
      }
    }
    loadProfile();
  }, [token]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const body: Record<string, string> = {};
    if (nickname) body.nickname = nickname;
    if (email) body.email = email;
    if (password) body.password = password;

    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
      }
    } catch {
      setError("Could not connect to the server.");
    }
  }

  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={handleSubmit} method="POST" className="space-y-6">
            <NicknameInputBlock
              setNickname={setNickname}
              value={nickname}
            />
            <EmailInputBlock
              setEmail={setEmail}
              value={email}
            />
            <PasswordInputBlock
              setPassword={setPassword}
              mode={"register"}
            />
            <ConfirmPasswordBlock
              setConfirmPassword={setConfirmPassword}
            />

            {error ? <ErrorParagraph errorMsg={error}/> : null }

            <SaveButton />
          </form>
        </div>
      </div>
  )
};
