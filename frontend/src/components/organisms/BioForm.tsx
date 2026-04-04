import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { API_URL } from "../../utils/api";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import DateOfBirthInputBlock from "../molecules/DateOfBirthInputBlock";
import GenderSelectorBlock from "../molecules/GenderSelectorBlock";
import AboutMeInputBlock from "../molecules/AboutMeInputBlock";
import ProfilePictureBlock from "../molecules/ProfilePictureBlock";
import SaveButton from "../atoms/SaveButton";

interface Option {
  readonly label: string;
  readonly value: string;
}

function createOption(label: string): Option {
  return { label, value: label };
}

const DEFAULT_GENDERS = ["Non-binary", "Female", "Male"];
const GenderOptions: Option[] = DEFAULT_GENDERS.map(createOption);

interface LocationSuggestion {
  lat: string;
  lon: string;
  city: string;
  country: string;
  displayName: string;
}

function extractCity(addr: Record<string, string>): string {
  return addr.city ?? addr.town ?? addr.village ?? addr.municipality ?? addr.hamlet ?? addr.suburb ?? "";
}

function buildDisplayName(city: string, addr: Record<string, string>): string {
  const parts = [city];
  const region = addr.state ?? addr.region ?? addr.county;
  if (region) parts.push(region);
  if (addr.country) parts.push(addr.country);
  return parts.join(", ");
}

async function searchLocations(query: string): Promise<LocationSuggestion[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1&featuretype=settlement`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const seen = new Set<string>();
    return (data as Record<string, unknown>[])
      .map(item => {
        const addr = (item.address ?? {}) as Record<string, string>;
        const city = extractCity(addr) || (item.display_name as string).split(",")[0].trim();
        const displayName = buildDisplayName(city, addr);
        return { lat: item.lat as string, lon: item.lon as string, city, country: addr.country ?? "", displayName };
      })
      .filter(s => {
        if (seen.has(s.displayName)) return false;
        seen.add(s.displayName);
        return true;
      });
  } catch {
    return [];
  }
}

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; country: string } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=10`,
      { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = (data.address ?? {}) as Record<string, string>;
    const city = extractCity(addr);
    if (!city) return null;
    return { city, country: addr.country ?? "" };
  } catch {
    return null;
  }
}

export default function BioForm() {
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [gender, setGender] = useState<Option | null>(null);
  const [country, setCountry] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationSearch, setLocationSearch] = useState<string>("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [aboutMe, setAboutMe] = useState<string>("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [existingAvatarUrl, setExistingAvatarUrl] = useState<string | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function loadProfile() {
      try {
        const [bioRes, profileRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/api/me/bio`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/me/profile`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        if (bioRes.ok) {
          const bio = await bioRes.json();
          setDateOfBirth(bio.dateOfBirth ?? "");
          setGender(bio.gender ? createOption(bio.gender) : null);
          setCountry(bio.country ?? "");
          setCity(bio.city ?? "");
          setLatitude(bio.latitude ?? null);
          setLongitude(bio.longitude ?? null);
        }
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setAboutMe(profile.aboutMe ?? "");
        }
        if (summaryRes.ok) {
          const summary = await summaryRes.json();
          const pic = summary.profilePictureUrl;
          setExistingAvatarUrl(pic ? `${API_URL}${pic}` : null);
        }
      } catch { /* server unreachable */ }
    }
    loadProfile();
  }, [token]);

  // Debounce Nominatim search as user types
  useEffect(() => {
    if (locationSearch.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      const results = await searchLocations(locationSearch);
      setSuggestions(results);
    }, 400);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  function selectSuggestion(s: LocationSuggestion) {
    setCity(s.city);
    setCountry(s.country);
    setLatitude(parseFloat(s.lat));
    setLongitude(parseFloat(s.lon));
    setLocationSearch("");
    setSuggestions([]);
  }

  function handleDetectLocation() {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        const result = await reverseGeocode(lat, lng);
        setDetecting(false);
        if (result) {
          setCity(result.city);
          setCountry(result.country);
        } else {
          setLocationError("Could not detect city. Try searching manually below.");
        }
      },
      () => {
        setDetecting(false);
        setLocationError("Location access was denied. Allow it in your browser settings.");
      }
    );
  }

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const bioBody: Record<string, string | number> = {};
      if (gender) bioBody.gender = gender.value;
      if (dateOfBirth) bioBody.dateOfBirth = dateOfBirth;
      if (country) bioBody.country = country;
      if (city) bioBody.city = city;
      if (latitude !== null) bioBody.latitude = latitude;
      if (longitude !== null) bioBody.longitude = longitude;

      const [bioRes, profileRes] = await Promise.all([
        fetch(`${API_URL}/api/me/bio`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(bioBody),
        }),
        fetch(`${API_URL}/api/me/profile`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ aboutMe }),
        }),
      ]);

      if (removePicture) {
        await fetch(`${API_URL}/api/me/picture`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setRemovePicture(false);
      } else if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        await fetch(`${API_URL}/api/me/picture`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      }

      if (!bioRes.ok || !profileRes.ok) {
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

  const hasLocation = city || country || latitude !== null;

  return (
    <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <ProfilePictureBlock setProfilePicture={setProfilePicture} existingAvatarUrl={existingAvatarUrl} onRemove={handleRemovePicture} />
          <DateOfBirthInputBlock setDateOfBirth={setDateOfBirth} value={dateOfBirth} />
          <GenderSelectorBlock setGender={setGender} options={GenderOptions} value={gender} />

          <div>
            <label className="block text-sm font-bold text-gray-100 mb-1">Your location</label>
            <p className="text-xs text-amber-200 mb-2">
              Only your city and country are shown to others — never exact coordinates.
            </p>

            {/* Detected / confirmed location — editable pill */}
            {hasLocation && (
              <div className="flex items-center gap-1 bg-amber-400 rounded-lg px-3 py-2 mb-2">
                <span className="shrink-0 text-sm">📍</span>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="City"
                  className="min-w-0 flex-1 bg-transparent text-sm text-amber-950 placeholder-amber-700 focus:outline-none"
                />
                <span className="text-amber-700 text-sm shrink-0">,</span>
                <input
                  type="text"
                  value={country}
                  onChange={e => setCountry(e.target.value)}
                  placeholder="Country"
                  className="min-w-0 flex-1 bg-transparent text-sm text-amber-950 placeholder-amber-700 focus:outline-none"
                />
              </div>
            )}

            {/* GPS detect button */}
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={detecting}
              className="w-full px-4 py-2 rounded-lg text-sm bg-amber-950 text-white font-semibold hover:bg-amber-800 transition-colors mb-2 disabled:opacity-60"
            >
              {detecting ? "Detecting…" : hasLocation ? "📍 Update my location" : "📍 Detect my location"}
            </button>
            {locationError && <p className="text-red-200 text-xs mb-2">{locationError}</p>}

            {/* City search with Nominatim autocomplete */}
            <div className="relative">
              <input
                type="text"
                value={locationSearch}
                onChange={e => setLocationSearch(e.target.value)}
                placeholder="Or search for a city…"
                className="w-full rounded-lg bg-amber-200 px-3 py-2 text-sm text-amber-950 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-700"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 bg-amber-950 rounded-lg overflow-hidden shadow-lg">
                  {suggestions.map((s, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-amber-800 transition-colors"
                      >
                        {s.displayName}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <AboutMeInputBlock setAboutMe={setAboutMe} value={aboutMe} />

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
