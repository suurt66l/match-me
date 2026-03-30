import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import SaveButton from "../atoms/SaveButton";
import GameTimeInputBlock from "../molecules/GameTimeInputBlock";
import GameGenresSelectorBlock from "../molecules/GameGenresSelectorBlock";
import LookingForInputBlock from "../molecules/LookingForSelectBlock";
import PlatformSelectBlock from "../molecules/PlatfromSelectorBlock";
import IntensityInputBlock from "../molecules/IntensityInputBlock";

import GamesSelectorBlock from "../molecules/GamesSelectorBlock";
import { timeZones } from "../../data/timezones";

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


//Tepmorary Dataset
const DEFAULT_GENRES = [
  "MOBA",
  "FPS",
  "Strategy",
  "RPG"
]
//Tepmorary Dataset
const DEFAULT_GAMES = [
  "CS:GO",
  "DOTA 2",
  "Warhamer",
  "Snake"
]
//Tepmorary Dataset
const DEFAULT_PLATFORMS = [
  "PC",
  "PlayStation 5",
  "XBox One",
  "Nintendo Switch"
]
//Tepmorary Datasets
const GameOptions: Option[] = DEFAULT_GAMES.map(createOption)
const GenreOptions: Option[] = DEFAULT_GENRES.map(createOption)
const PlatformOptions: Option[] = DEFAULT_PLATFORMS.map(createOption)

const TimeZoneOptions: Option[] = timeZones.map(createOption) 

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
  const [lookingFor, setLookingFor] = useState<string>("");
  const [platforms, setPlatforms] = useState<Option[]>([]);
  const [intensity, setIntensity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  /* Load profile data on the start */
  useEffect(() => {
    async function loadPreferences() {
      try {
        const response = await fetch("http://localhost:8080/api/me/bio", {
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
          setLookingFor(data.lookingFor ?? "");
          setPlatforms(optionsFromDatabase(data.platforms));
          setIntensity(data.intensity ?? "");
        }
      } catch {
        console.log("Can't load preferences. Server isn't available! ")
      }
    }
    loadPreferences();
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
    if (lookingFor) body.lookingFor = lookingFor;
    if (platforms) body.platforms = optionsToDatabase(platforms);
    if (intensity) body.intensity = intensity;

    try {
      const response = await fetch("http://localhost:8080/api/me/bio", {
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
          <GamesSelectorBlock setGames={setGames} gameOptions={GameOptions} value={games} />
          <GameGenresSelectorBlock setGameGenres={setGameGenres} genreOptions={GenreOptions} value={gameGenres} />
          <PlatformSelectBlock setPlatforms={setPlatforms} platformOptions={PlatformOptions}  value={platforms} />
          <LookingForInputBlock setLookingFor={setLookingFor} value={lookingFor} />
          <IntensityInputBlock setIntensity={setIntensity} value={intensity} />

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
