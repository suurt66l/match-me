import { useState, useEffect } from "react";
import { useAuth } from "../../utils/AuthContext";
import ErrorParagraph from "../atoms/ErrorParagraph";
import SuccessParagraph from "../atoms/SuccessParagraph";
import SaveButton from "../atoms/SaveButton";
import GameTimeInputBlock from "../molecules/GameTimeInputBlock";
import GamesInputBlock from "../molecules/GamesInputBlock";
import GameGenresInputBlock from "../molecules/GameGenresInput";
import LookingForInputBlock from "../molecules/LookingForSelectBlock";
import PlatformSelectBlock from "../molecules/PlatfromSelectBlock";
import IntensityInputBlock from "../molecules/IntensityInputBlock";

export default function PreferencesForm() {
  const [gameTimeFrom, setGameTimeFrom] = useState<string>("");
  const [gameTimeTo, setGameTimeTo] = useState<string>("");
  const [timeZone, setTimeZone] = useState<string>("");
  const [games, setGames] = useState<string>("");
  const [gameGenres, setGameGenres] = useState<string>("");
  const [lookingFor, setLookingFor] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [intensity, setIntensity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  /* Load profile data on the start */
  useEffect(() => {
    async function loadBio() {
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
          setTimeZone(data.timezone ?? "");
          setGames(data.gamePreference ?? "");
          setGameGenres(data.gameGenrePreference ?? "");
          setLookingFor(data.lookingFor ?? "");
          setPlatform(data.platforms ?? "");
          setIntensity(data.intensity ?? "");
        }
      } catch {
        // Server unreachable — form starts empty
      }
    }
    loadBio();
  }, [token]);

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    // Map frontend state names back to backend field names
    const body: Record<string, string> = {};
    if (gameTimeFrom || gameTimeTo) body.timeRange = `${gameTimeFrom}-${gameTimeTo}`;
    if (timeZone) body.timezone = timeZone;
    if (games) body.gamePreference = games;
    if (gameGenres) body.gameGenrePreference = gameGenres;
    if (lookingFor) body.lookingFor = lookingFor;
    if (platform) body.platforms = platform;
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
            setTimeZone={setTimeZone}
            gameTimeFrom={gameTimeFrom}
            gameTimeTo={gameTimeTo}
            timeZone={timeZone}
          />
          <GamesInputBlock setGames={setGames} value={games} />
          <GameGenresInputBlock setGameGenres={setGameGenres} value={gameGenres} />
          <LookingForInputBlock setLookingFor={setLookingFor} value={lookingFor} />
          <PlatformSelectBlock setPlatform={setPlatform} value={platform} />
          <IntensityInputBlock setIntensity={setIntensity} value={intensity} />

          {error && <ErrorParagraph errorMsg={error} />}
          {success && <SuccessParagraph msg={success} />}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
