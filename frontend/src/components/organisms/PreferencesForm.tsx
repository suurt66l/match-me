import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import { API_URL } from "../../utils/api";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import SaveButton from "../atoms/SaveButton";
import GameTimeInputBlock from "../molecules/GameTimeInputBlock";
import GameGenresSelectorBlock from "../molecules/GameGenresSelectorBlock";
import LookingForSelectorBlock from "../molecules/LookingForSelectorBlock";
import PlatformSelectorBlock from "../molecules/PlatfromSelectorBlock";
import IntensityInputBlock from "../molecules/IntensityInputBlock";
import GamesSelectorBlock from "../molecules/GamesSelectorBlock";
import PreferredGenderSelectorBlock from "../molecules/PreferredGenderSelectorBlock";
import PreferredAgeRangeBlock from "../molecules/PreferredAgeRangeBlock";
import { timeZones } from "../../data/timezones";

interface Option {
  readonly label: string;
  readonly value: string;
}

function createOption(label: string): Option {
  return { label, value: label };
}

const DEFAULT_GENDERS = ["Male", "Female", "Non-binary"];
const GenderOptions: Option[] = DEFAULT_GENDERS.map(createOption);

const DEFAULT_LOOKING_FOR = ["Play together", "Friendship", "Just to chat", "Relationships IRL"];
const TimeZoneOptions: Option[] = timeZones.map(createOption);
const LookingForOptions: Option[] = DEFAULT_LOOKING_FOR.map(createOption);

function optionsFromDatabase(options: string): Option[] {
  return options ? options.split(",").map(createOption) : [];
}

function optionsToDatabase(options: readonly Option[]): string {
  return options.map(option => option.value).join(",");
}

export default function PreferencesForm() {
  const [gameTimeFrom, setGameTimeFrom] = useState<string>("");
  const [gameTimeTo, setGameTimeTo] = useState<string>("");
  const [timeZone, setTimeZone] = useState<Option | null>(null);
  const [games, setGames] = useState<Option[]>([]);
  const [gameGenres, setGameGenres] = useState<Option[]>([]);
  const [lookingFor, setLookingFor] = useState<Option[]>([]);
  const [platforms, setPlatforms] = useState<Option[]>([]);
  const [intensity, setIntensity] = useState<string>("5");
  const [preferredGenders, setPreferredGenders] = useState<Option[]>([]);
  const [preferredAgeMin, setPreferredAgeMin] = useState<string>("");
  const [preferredAgeMax, setPreferredAgeMax] = useState<string>("");
  const [maxDistanceKm, setMaxDistanceKm] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [gameOptions, setGameOptions] = useState<Option[]>([]);
  const [genreOptions, setGenreOptions] = useState<Option[]>([]);
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);

  const { token } = useAuth();

  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch(`${API_URL}/api/me/bio`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const timeRange: string = data.timeRange ?? "";
          const [from, to] = timeRange.includes("-") ? timeRange.split("-") : [timeRange, ""];
          setGameTimeFrom(from);
          setGameTimeTo(to);
          setTimeZone(data.timezone ? createOption(data.timezone) : null);
          setGames(optionsFromDatabase(data.gamePreference));
          setGameGenres(optionsFromDatabase(data.gameGenrePreference));
          setLookingFor(optionsFromDatabase(data.lookingFor));
          setPlatforms(optionsFromDatabase(data.platforms));
          setIntensity(data.intensity ?? "5");
          setPreferredGenders(optionsFromDatabase(data.preferredGenders));
          setPreferredAgeMin(data.preferredAgeMin?.toString() ?? "");
          setPreferredAgeMax(data.preferredAgeMax?.toString() ?? "");
          setMaxDistanceKm(data.maxDistanceKm?.toString() ?? "");
        }
      } catch {
        console.log("Can't load preferences. Server isn't available!");
      }
    }

    async function loadOptions() {
      try {
        const resGameOpts = await fetch(`${API_URL}/api/lookup/games`, { headers: { Authorization: `Bearer ${token}` } });
        const dataGameOpts: string[] = await resGameOpts.json();
        setGameOptions(dataGameOpts.map(createOption));

        const resGenreOpts = await fetch(`${API_URL}/api/lookup/genres`, { headers: { Authorization: `Bearer ${token}` } });
        const dataGenreOpts: string[] = await resGenreOpts.json();
        setGenreOptions(dataGenreOpts.map(createOption));

        const resPlatformOpts = await fetch(`${API_URL}/api/lookup/platforms`, { headers: { Authorization: `Bearer ${token}` } });
        const dataPlatformOpts: string[] = await resPlatformOpts.json();
        setPlatformOptions(dataPlatformOpts.map(createOption));
      } catch {
        console.log("Server is unreachable! Can't retrieve data from the server.");
      }
    }

    loadPreferences();
    loadOptions();
  }, [token]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const body: Record<string, string> = {};
    if (gameTimeFrom || gameTimeTo) body.timeRange = `${gameTimeFrom}-${gameTimeTo}`;
    if (timeZone) body.timezone = timeZone.value;
    if (games) body.gamePreference = optionsToDatabase(games);
    if (gameGenres) body.gameGenrePreference = optionsToDatabase(gameGenres);
    if (lookingFor) body.lookingFor = optionsToDatabase(lookingFor);
    if (platforms) body.platforms = optionsToDatabase(platforms);
    if (intensity) body.intensity = intensity;
    if (preferredGenders.length > 0) body.preferredGenders = optionsToDatabase(preferredGenders);
    if (preferredAgeMin) body.preferredAgeMin = preferredAgeMin;
    if (preferredAgeMax) body.preferredAgeMax = preferredAgeMax;
    if (maxDistanceKm) body.maxDistanceKm = maxDistanceKm;

    try {
      const response = await fetch(`${API_URL}/api/me/bio`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
      } else {
        setSuccess("Preferences saved successfully.");
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
          <GameTimeInputBlock
            setGameTimeFrom={setGameTimeFrom}
            setGameTimeTo={setGameTimeTo}
            gameTimeFrom={gameTimeFrom}
            gameTimeTo={gameTimeTo}
            setTimeZone={setTimeZone}
            timeZone={timeZone}
            timeZoneOptions={TimeZoneOptions}
          />
          <GamesSelectorBlock setGames={setGames} gameOptions={gameOptions} value={games} />
          <GameGenresSelectorBlock setGameGenres={setGameGenres} genreOptions={genreOptions} value={gameGenres} />
          <PlatformSelectorBlock setPlatforms={setPlatforms} platformOptions={platformOptions} value={platforms} />
          <LookingForSelectorBlock setLookingFor={setLookingFor} lookingForOptions={LookingForOptions} value={lookingFor} />
          <IntensityInputBlock setIntensity={setIntensity} value={intensity} />
          <PreferredGenderSelectorBlock setGenders={setPreferredGenders} options={GenderOptions} value={preferredGenders} />
          <PreferredAgeRangeBlock minAge={preferredAgeMin} maxAge={preferredAgeMax} setMinAge={setPreferredAgeMin} setMaxAge={setPreferredAgeMax} />

          <div>
            <label className="block text-sm font-bold text-gray-100 mb-1">Maximum match distance (km)</label>
            <p className="text-xs text-amber-200 mb-2">
              Only show matches within this radius of your location. Leave empty to match anyone regardless of distance.
            </p>
            <input
              type="number"
              min="1"
              max="20000"
              value={maxDistanceKm}
              onChange={e => setMaxDistanceKm(e.target.value)}
              placeholder="e.g. 500"
              className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm text-amber-950 placeholder-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-950"
            />
          </div>

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
