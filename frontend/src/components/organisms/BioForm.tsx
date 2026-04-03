import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { API_URL } from "../../utils/api";
import { countriesByContinent } from "../../data/countries";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import DateOfBirthInputBlock from "../molecules/DateOfBirthInputBlock";
import GenderSelectorBlock from "../molecules/GenderSelectorBlock";
import LocationSelectorBlock from "../molecules/LocationSelectorBlock";
import AboutMeInputBlock from "../molecules/AboutMeInputBlock";
import ProfilePictureBlock from "../molecules/ProfilePictureBlock";
import SaveButton from "../atoms/SaveButton";
import SingleSelect from "../atoms/SingleSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

function createOption(label: string): Option {
  return { label, value: label };
}

const DEFAULT_GENDERS = ["Non-binary", "Female", "Male"];
const DEFAULT_CONTINENTS = ["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"];

const GenderOptions: Option[] = DEFAULT_GENDERS.map(createOption);
const ContinentsOptions: Option[] = DEFAULT_CONTINENTS.map(createOption);

export default function BioForm() {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<Option | null>(null);
  const [continent, setContinent] = useState<Option | null>(null);
  const [country, setCountry] = useState<Option | null>(null);
  const [aboutMe, setAboutMe] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  // When continent changes, reset country if it no longer belongs to the new continent
  useEffect(() => {
    if (!continent) { setCountry(null); return; }
    const valid = countriesByContinent[continent.value] ?? [];
    if (country && !valid.includes(country.value)) setCountry(null);
  }, [continent]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const bioResponse = await fetch(`${API_URL}/api/me/bio`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (bioResponse.ok) {
          const bio = await bioResponse.json();
          setDateOfBirth(bio.dateOfBirth ?? "");
          setGender(bio.gender ? createOption(bio.gender) : null);
          setContinent(bio.location ? createOption(bio.location) : null);
          setCountry(bio.country ? createOption(bio.country) : null);
        }

        const profileResponse = await fetch(`${API_URL}/api/me/profile`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          setAboutMe(profile.aboutMe ?? "");
        }

        const summaryResponse = await fetch(`${API_URL}/api/me`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (summaryResponse.ok) {
          const summary = await summaryResponse.json();
          const pic = summary.profilePictureUrl;
          setExistingAvatarUrl(pic ? `${API_URL}${pic}` : null);
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

    try {
      const bioBody: Record<string, string> = {};
      if (gender) bioBody.gender = gender.value;
      if (dateOfBirth) bioBody.dateOfBirth = dateOfBirth;
      if (continent) bioBody.location = continent.value;
      if (country) bioBody.country = country.value;

      const bioResponse = await fetch(`${API_URL}/api/me/bio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(bioBody),
      });

      const profileResponse = await fetch(`${API_URL}/api/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ aboutMe }),
      });

      if (removePicture) {
        await fetch(`${API_URL}/api/me/picture`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` },
        });
        setRemovePicture(false);
      } else if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        await fetch(`${API_URL}/api/me/picture`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
      }

      if (!bioResponse.ok || !profileResponse.ok) {
        setError("Something went wrong while saving.");
      } else {
        setSuccess("Bio saved successfully.");
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch {
      setError("Could not connect to the server.");
    }
  }

  function handleRemovePicture() {
    setRemovePicture(true);
    setExistingAvatarUrl(null);
    setProfilePicture(null);
  }

  // Countries available for the currently selected continent
  const countryOptions: Option[] = continent
    ? (countriesByContinent[continent.value] ?? []).map(createOption)
    : [];

  return (
    <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <ProfilePictureBlock setProfilePicture={setProfilePicture} existingAvatarUrl={existingAvatarUrl} onRemove={handleRemovePicture} />
          <DateOfBirthInputBlock setDateOfBirth={setDateOfBirth} value={dateOfBirth} />
          <GenderSelectorBlock setGender={setGender} options={GenderOptions} value={gender} />
          <LocationSelectorBlock setContinent={setContinent} options={ContinentsOptions} value={continent} />

          {/* Country — only shown when a continent with countries is selected */}
          {countryOptions.length > 0 && (
            <div>
              <label className="block text-sm font-bold text-gray-100">Country:</label>
              <SingleSelect
                onChange={setCountry}
                options={countryOptions}
                value={country}
                placeholder="Select country"
              />
            </div>
          )}

          <AboutMeInputBlock setAboutMe={setAboutMe} value={aboutMe} />

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
