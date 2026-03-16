import ErrorParagraph from "../atoms/ErrorParagraph";
import SaveButton from "../atoms/SaveButton";
import GameTimeInputBlock from "../molecules/GameTimeInputBlock";
import GamesInputBlock from "../molecules/GamesInputBlock";
import GameGenresInputBlock from "../molecules/GameGenresInput";
import LookingForInputBlock from "../molecules/LookingForSelectBlock";
import PlatformSelectBlock from "../molecules/PlatfromSelectBlock";
import IntensityInputBlock from "../molecules/IntensityInputBlock";

interface Props {
  setGameTimeFrom: (value: string) => void;
  setGameTimeTo: (value: string) => void;

  setGames: (value: string) => void;
  setGameGenres: (value: string) => void;

  setLookingFor: (value: string) => void;
  setPlatform: (value: string) => void;
  setIntensity: (value: string) => void;

  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  error: string | null;
}
export default function PreferencesForm ({ setGameTimeFrom, setGameTimeTo, setGames, setGameGenres, setLookingFor, setPlatform, setIntensity, onSubmit, error }: Props) {
  
  
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={onSubmit} method="POST" className="space-y-6">
            { /* <ProfilePictureBlock setProfilePicture={setProfilePicture} /> */} 
            <GameTimeInputBlock setGameTimeFrom={setGameTimeFrom} setGameTimeTo={setGameTimeTo}/>
            <GamesInputBlock setGames={setGames} /> 
            <GameGenresInputBlock setGameGenres={setGameGenres}/> 
            <LookingForInputBlock setLookingFor={setLookingFor} /> 
            <PlatformSelectBlock setPlatform={setPlatform} /> 
            <IntensityInputBlock setIntensity={setIntensity} /> 

            {/* If error exist than display it */}
            {error ? <ErrorParagraph errorMsg={error}/> : null }

            <SaveButton />
          </form>
        </div>
      </div>
  )
};