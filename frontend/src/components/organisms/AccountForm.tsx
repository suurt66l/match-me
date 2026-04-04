import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { API_URL } from "../../utils/api";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import NewEmailInputBlock from "../molecules/NewEmailInputBlock";
import CurrentPasswordInputBlock from "../molecules/CurrentPasswordInputBlock";
import NewPasswordInputBlock from "../molecules/NewPasswordInputBlock";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-bold text-gray-100 mb-3">{children}</h3>;
}

function InputField({ label, type = "text", value, onChange, placeholder }: {
  label?: string; type?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-100 mb-1">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg bg-amber-200 px-3 py-2 text-sm text-amber-950 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700"
      />
    </div>
  );
}

function SaveBtn({ label = "Save" }: { label?: string }) {
  return (
    <button type="submit" className="w-full rounded-lg bg-amber-950 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 transition-colors">
      {label}
    </button>
  );
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="bg-amber-600 rounded-xl px-4 py-4 flex flex-col gap-3">{children}</div>;
}

async function putAccount(token: string, body: Record<string, string>) {
  return fetch(`${API_URL}/api/me/account`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

export default function AccountForm() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  // Email change section
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSuccess, setEmailSuccess] = useState<string | null>(null);

  // Nickname section
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [nicknameSuccess, setNicknameSuccess] = useState<string | null>(null);

  // Password change section
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/me/account`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNickname(data.nickname ?? "");
          setEmail(data.email ?? "");
        }
      } catch { /* unreachable */ }
    }
    load();
  }, [token]);

  async function handleNickname(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setNicknameError(null);
    setNicknameSuccess(null);
    const res = await putAccount(token!, { nickname });
    if (res.ok) {
      setNicknameSuccess("Nickname updated.");
      setTimeout(() => setNicknameSuccess(null), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setNicknameError(d.message ?? "Something went wrong.");
    }
  }

  async function handleEmail(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);
    setEmailSuccess(null);
    if (!newEmail) { setEmailError("Enter a new email address."); return; }
    if (!emailPassword) { setEmailError("Enter your current password to confirm."); return; }
    const res = await putAccount(token!, { email: newEmail, currentPassword: emailPassword });
    if (res.ok) {
      setEmail(newEmail);
      setNewEmail("");
      setEmailPassword("");
      setEmailSuccess("Email updated.");
      setTimeout(() => setEmailSuccess(null), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setEmailError(d.message ?? "Something went wrong.");
    }
  }

  async function handlePassword(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!newPassword) { setPasswordError("Enter a new password."); return; }
    if (newPassword !== confirmPassword) { setPasswordError("Passwords do not match."); return; }
    const res = await putAccount(token!, { password: newPassword });
    if (res.ok) {
      setNewPassword("");
      setConfirmPassword("");
      setPasswordSuccess("Password updated.");
      setTimeout(() => setPasswordSuccess(null), 3000);
    } else {
      const d = await res.json().catch(() => ({}));
      setPasswordError(d.message ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm flex flex-col gap-6">

        {/* Nickname */}
        <Section>
          <SectionTitle>Nickname</SectionTitle>
          <form onSubmit={handleNickname} className="flex flex-col gap-3">
            <InputField value={nickname} onChange={setNickname} />
            {nicknameError && <ErrorParagraph errorMsg={nicknameError} />}
            {nicknameSuccess && <SuccessParagraph msg={nicknameSuccess} />}
            <SaveBtn label="Update nickname" />
          </form>
        </Section>

        {/* Email */}
        <Section>
          <SectionTitle>Change email</SectionTitle>
          <p className="text-xs text-gray-100 -mt-2">Current: {email}</p>
          <form onSubmit={handleEmail} className="flex flex-col gap-3">
            <NewEmailInputBlock value={newEmail} setEmail={setNewEmail} />
            <CurrentPasswordInputBlock setPassword={setEmailPassword} />
            {emailError && <ErrorParagraph errorMsg={emailError} />}
            {emailSuccess && <SuccessParagraph msg={emailSuccess} />}
            <SaveBtn label="Update email" />
          </form>
        </Section>

        {/* Password */}
        <Section>
          <SectionTitle>Change password</SectionTitle>
          <form onSubmit={handlePassword} className="flex flex-col gap-3">
            <NewPasswordInputBlock setPassword={setNewPassword} />
            <InputField label="Confirm new password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
            {passwordError && <ErrorParagraph errorMsg={passwordError} />}
            {passwordSuccess && <SuccessParagraph msg={passwordSuccess} />}
            <SaveBtn label="Update password" />
          </form>
        </Section>

      </div>
    </div>
  );
}
