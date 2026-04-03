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
import { countriesByContinent } from "../../data/countries";
import MultiSelect from "../atoms/MultiSelect";

interface Option {
  readonly label: string;
  readonly value: string;
}

function createOption (label: string): Option {
  return ({
    label,
    value: label
  });
}


const DEFAULT_GENDERS = ["Male", "Female", "Non-binary"];
const GenderOptions: Option[] = DEFAULT_GENDERS.map(createOption);

const DEFAULT_CONTINENTS = ["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"];
const ContinentOptions: Option[] = DEFAULT_CONTINENTS.map(createOption);
const AllCountryOptions: Option[] = Object.values(countriesByContinent).flat().sort().map(createOption);

const DEFAULT_LOOKING_FOR = [
  "Play together",
  "Friendship",
  "Just to chat",
  "Relationships IRL"
]

const TimeZoneOptions: Option[] = timeZones.map(createOption)
const LookingForOptions: Option[] = DEFAULT_LOOKING_FOR.map(createOption)

function optionsFromDatabase(options: string): Option[]{
  return options ? options.split(",").map(createOption) : [];
}

function optionsToDatabase(options: readonly Option[]): string{
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
  const [matchScope, setMatchScope] = useState<string>("global");
  const [preferredContinents, setPreferredContinents] = useState<Option[]>([]);
  const [preferredCountries, setPreferredCountries] = useState<Option[]>([]);
  const [myContinent, setMyContinent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [gameOptions, setGameOptions] = useState<Option[]>([]);
  const [genreOptions, setGenreOptions] = useState<Option[]>([]);
  const [platformOptions, setPlatformOptions] = useState<Option[]>([]);

  const { token } = useAuth();

  /* Load profile data on the start */
  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch(`${API_URL}/api/me/bio`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          // Backend field names differ from frontend state names — map them here
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
          setMatchScope(data.matchScope ?? "global");
          setPreferredContinents(optionsFromDatabase(data.preferredContinents));
          setPreferredCountries(optionsFromDatabase(data.preferredCountries));
          setMyContinent(data.location ?? null);
        }
      } catch {
        console.log("Can't load preferences. Server isn't available! ")
      }
    }

    async function loadOptions() {
      try{
        // Games Options
        const resGameOpts = await fetch(`${API_URL}/api/lookup/games`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataGameOpts: string[] = await resGameOpts.json();
        setGameOptions(dataGameOpts.map(createOption));
        // Genre Options
        const resGenreOpts = await fetch(`${API_URL}/api/lookup/genres`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataGenreOpts: string[] = await resGenreOpts.json();
        setGenreOptions(dataGenreOpts.map(createOption));
        // Platform Options
        const resPlatfromOpts = await fetch(`${API_URL}/api/lookup/platforms`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const dataPlatfromOpts: string[] = await resPlatfromOpts.json();
        setPlatformOptions(dataPlatfromOpts.map(createOption));
      } catch {
        console.log("Server is unreachable! Can't retrieve data from the server.")
      }
    }
    loadPreferences();
    loadOptions();
  }, [token]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Prepare data for sending to Backend
    // Map frontend state names back to backend field names
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
    body.matchScope = matchScope;
    body.preferredContinents = optionsToDatabase(preferredContinents);
    body.preferredCountries = optionsToDatabase(preferredCountries);

    try {
      const response = await fetch(`${API_URL}/api/me/bio`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message ?? "Something went wrong.");
      } else {
        setSuccess("Preferences saved successfully.");
        setTimeout(() => setSuccess(null), 3000); //Cleans Success message after 3s
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
          <PlatformSelectorBlock setPlatforms={setPlatforms} platformOptions={platformOptions}  value={platforms} />
          <LookingForSelectorBlock setLookingFor={setLookingFor} lookingForOptions={LookingForOptions} value={lookingFor} />
          <IntensityInputBlock setIntensity={setIntensity} value={intensity} />
          <PreferredGenderSelectorBlock setGenders={setPreferredGenders} options={GenderOptions} value={preferredGenders} />
          <PreferredAgeRangeBlock minAge={preferredAgeMin} maxAge={preferredAgeMax} setMinAge={setPreferredAgeMin} setMaxAge={setPreferredAgeMax} />

          <div>
            <label className="block text-sm font-bold text-gray-100 mb-1">Match scope</label>
            <p className="text-xs text-amber-200 mb-2">Your continent and country are configured in the Bio tab.</p>
            <div className="flex flex-col gap-2">
              {[
                { value: "global",   label: "Global",   desc: "Match with anyone worldwide" },
                { value: "regional", label: "Regional", desc: "Match within my continent only" },
                { value: "local",    label: "Local",    desc: "Match within my country only" },
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMatchScope(opt.value)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                    matchScope === opt.value
                      ? "bg-amber-950 text-amber-300 font-semibold"
                      : "bg-amber-400 text-amber-950 hover:bg-amber-500"
                  }`}
                >
                  <span className="font-semibold">{opt.label}</span> — {opt.desc}
                </button>
              ))}
            </div>

            {matchScope === "global" && (
              <div className="mt-3">
                <label className="block text-sm font-bold text-gray-100 mb-1">Limit to continents (optional)</label>
                <p className="text-xs text-amber-200 mb-1">Leave empty to match anyone worldwide.</p>
                <MultiSelect
                  options={ContinentOptions}
                  value={preferredContinents}
                  onChange={setPreferredContinents}
                  placeholder="Any continent"
                />
              </div>
            )}

            {matchScope === "regional" && (
              <div className="mt-3">
                <label className="block text-sm font-bold text-gray-100 mb-1">Limit to countries (optional)</label>
                <p className="text-xs text-amber-200 mb-1">Leave empty to match anyone in your continent.</p>
                <MultiSelect
                  options={myContinent ? (countriesByContinent[myContinent] ?? []).map(createOption) : AllCountryOptions}
                  value={preferredCountries}
                  onChange={setPreferredCountries}
                  placeholder="Any country"
                />
              </div>
            )}
          </div>

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
