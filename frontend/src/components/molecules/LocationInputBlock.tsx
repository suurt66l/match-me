import CountryLabel from "../atoms/CountryLabel";
import CountrySelect from "../atoms/CountrySelect";

interface Props {
  setCountry: (value: string) => void;
  country: string;
}

export default function LocationInputBlock({setCountry, country} : Props) {
    return (
            <div>
              <CountryLabel />
              <div className="mt-2">
                <CountrySelect
                  setCountry={setCountry}
                  value={country}
                />
              </div>
            </div>
    )
};