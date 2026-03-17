import { useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import ErrorParagraph from "../atoms/ErrorParagraph";
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
  const [city, setCity] = useState<string>("");
  const [aboutMe, setAboutMe] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    // FormData is required when sending files — can't use JSON.stringify with binary data
    const formData = new FormData();
    if (dateOfBirth) formData.append("dateOfBirth", dateOfBirth);
    if (gender) formData.append("gender", gender);
    if (country) formData.append("country", country);
    if (city) formData.append("city", city);
    if (aboutMe) formData.append("aboutMe", aboutMe);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    try {
      const response = await fetch("http://localhost:8080/api/profile", {
        method: "PATCH",
        headers: {
          // Note: do NOT set Content-Type manually with FormData —
          // the browser sets it automatically with the correct multipart boundary
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
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
          <ProfilePictureBlock setProfilePicture={setProfilePicture} />
          <DateOfBirthInputBlock setDateOfBirth={setDateOfBirth} />
          <GenderSelectBlock setGender={setGender} />
          <LocationInputBlock setCountry={setCountry} setCity={setCity} />
          <AboutMeInputBlock setAboutMe={setAboutMe} />

          {error ? <ErrorParagraph errorMsg={error} /> : null}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
