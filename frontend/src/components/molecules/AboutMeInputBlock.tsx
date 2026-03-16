import AboutMeInput from "../atoms/AboutMeInput";
import AboutMeLabel from "../atoms/AboutMeLabel";

interface Props {
  setAboutMe: (value: string) => void;
}

export default function AboutMeInputBlock({setAboutMe} : Props) {
    return (
            <div>
              <AboutMeLabel />
              <div className="mt-2">
                <AboutMeInput setAboutMe={setAboutMe} />
              </div>
            </div>
    )
};