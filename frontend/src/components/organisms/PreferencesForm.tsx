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
  const [games, setGames] = useState<string>("");
  const [gameGenres, setGameGenres] = useState<string>("");
  const [lookingFor, setLookingFor] = useState<string>("");
  const [platform, setPlatform] = useState<string>("");
  const [intensity, setIntensity] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    async function loadBio() {
      try {
        const response = await fetch("http://localhost:8080/me/bio", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setGameTimeFrom(data.gameTimeFrom ?? "");
          setGameTimeTo(data.gameTimeTo ?? "");
          setGames(data.games ?? "");
          setGameGenres(data.gameGenres ?? "");
          setLookingFor(data.lookingFor ?? "");
          setPlatform(data.platform ?? "");
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

    const body: Record<string, string> = {};
    if (gameTimeFrom) body.gameTimeFrom = gameTimeFrom;
    if (gameTimeTo) body.gameTimeTo = gameTimeTo;
    if (games) body.games = games;
    if (gameGenres) body.gameGenres = gameGenres;
    if (lookingFor) body.lookingFor = lookingFor;
    if (platform) body.platform = platform;
    if (intensity) body.intensity = intensity;

    try {
      const response = await fetch("http://localhost:8080/api/bio", {
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
