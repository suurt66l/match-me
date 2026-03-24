import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import DateOfBirthInputBlock from "../molecules/DateOfBirthInputBlock";
import GenderSelectBlock from "../molecules/GenderSelectBlock";
import LocationInputBlock from "../molecules/LocationInputBlock";
import AboutMeInputBlock from "../molecules/AboutMeInputBlock";
import ProfilePictureBlock from "../molecules/ProfilePictureBlock";
import SaveButton from "../atoms/SaveButton";

export default function BioForm() {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [aboutMe, setAboutMe] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("http://localhost:8080/me/profile", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setDateOfBirth(data.dateOfBirth ?? "");
          setGender(data.gender ?? "");
          setCountry(data.country ?? "");
          setAboutMe(data.aboutMe ?? "");
          setExistingAvatarUrl(data.avatarUrl ?? null);
        }
      } catch {
        // Server unreachable — form starts empty
      }
    }
    loadProfile();
  }, [token]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (gender) formData.append("gender", gender);
    if (country) formData.append("country", country);
    if (aboutMe) formData.append("aboutMe", aboutMe);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
      } else {
        setSuccess("Bio saved successfully.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Could not connect to the server.");
    }
  }

  return (
    <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">

        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <ProfilePictureBlock setProfilePicture={setProfilePicture} existingAvatarUrl={existingAvatarUrl} />
          <DateOfBirthInputBlock setDateOfBirth={setDateOfBirth} value={dateOfBirth} />
          <GenderSelectBlock setGender={setGender} value={gender} />
          <LocationInputBlock setCountry={setCountry} country={country} />
          <AboutMeInputBlock setAboutMe={setAboutMe} value={aboutMe} />

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
