import ErrorParagraph from "../atoms/ErrorParagraph";
import DateOfBirthInputBlock from "../molecules/DateOfBirthInputBlock";
import GenderSelectBlock from "../molecules/GenderSelectBlock";
import LocationInputBlock from "../molecules/LocationInputBlock";
import AboutMeInputBlock from "../molecules/AboutMeInputBlock";
import SaveButton from "../atoms/SaveButton";

interface Props {
  setDateOfBirth: (value: string) => void;
  setGender: (value: string) => void;
  setCountry: (value: string) => void;
  setCity: (value: string) => void;
  setAboutMe: (value: string) => void;
  setProfilePicture: (value: string) => void;

  onSubmit: (event: React.SyntheticEvent<HTMLFormElement>) => void;
  error: string | null;
}
export default function BioForm ({ setDateOfBirth, setGender, setCountry, setCity, setAboutMe, setProfilePicture, onSubmit, error }: Props) {
  
  
  return (
      <div className="flex min-h-full justify-center px-8 py-12 bg-amber-500 rounded-xl">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">

          <form onSubmit={onSubmit} method="POST" className="space-y-6">
            { /* <ProfilePictureBlock setProfilePicture={setProfilePicture} /> */} 
            <DateOfBirthInputBlock setDateOfBirth={setDateOfBirth} />
            <GenderSelectBlock setGender={setGender} /> 
            <LocationInputBlock setCountry={setCountry} setCity={setCity}/> 
            <AboutMeInputBlock setAboutMe={setAboutMe} /> 

            {/* If error exist than display it */}
            {error ? <ErrorParagraph errorMsg={error}/> : null }

            <SaveButton />
          </form>
        </div>
      </div>
  )
};