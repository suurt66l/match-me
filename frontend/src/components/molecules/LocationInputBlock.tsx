import CityInput from "../atoms/CityInput";
import CityLabel from "../atoms/CityLabel";
import CountryLabel from "../atoms/CountryLabel";
import CountrySelect from "../atoms/CountrySelect";

interface Props {
  setCountry: (value: string) => void;
  setCity: (value: string) => void;
}

export default function LocationInputBlock({setCountry, setCity} : Props) {
    return (
            <div>
            <CountryLabel />
              <div className="mt-2">
                <CountrySelect 
                  setCountry={setCountry}
                />
              </div>
              <CityLabel />
              <div className="mt-2">
                <CityInput 
                  setCity={setCity}
                />
              </div>
            </div>
    )
};