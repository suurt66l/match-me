import { useState } from "react";
import { useAuth } from "../../utils/AuthContext";
import ErrorParagraph from "../atoms/ErrorParagraph";
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

  const { token } = useAuth();

  async function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("http://localhost:8080/api/bio", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ gameTimeFrom, gameTimeTo, games, gameGenres, lookingFor, platform, intensity }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message ?? "Something went wrong.");
    }
  }

  return (
    <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">

        <form onSubmit={handleSubmit} method="POST" className="space-y-6">
          <GameTimeInputBlock setGameTimeFrom={setGameTimeFrom} setGameTimeTo={setGameTimeTo} />
          <GamesInputBlock setGames={setGames} />
          <GameGenresInputBlock setGameGenres={setGameGenres} />
          <LookingForInputBlock setLookingFor={setLookingFor} />
          <PlatformSelectBlock setPlatform={setPlatform} />
          <IntensityInputBlock setIntensity={setIntensity} />

          {error ? <ErrorParagraph errorMsg={error} /> : null}

          <SaveButton />
        </form>
      </div>
    </div>
  );
}
