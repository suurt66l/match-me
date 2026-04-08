import AboutMeInput from "../atoms/AboutMeInput";
import AboutMeLabel from "../atoms/AboutMeLabel";

interface Props {
  setAboutMe: (value: string) => void;
  value: string;
}

export default function AboutMeInputBlock({setAboutMe, value} : Props) {
    return (
            <div>
              <AboutMeLabel />
              <div className="mt-2">
                <AboutMeInput 
                  setAboutMe={setAboutMe} 
                  value={value} />
              </div>
            </div>
    )
};