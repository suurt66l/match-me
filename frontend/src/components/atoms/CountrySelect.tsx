import CustomSelect from "./CustomSelect";
import { countries } from "../../data/countries";

interface Props {
  setCountry: (value: string) => void;
  value: string;
}

const options = countries.map(c => ({ value: c, label: c }));

export default function CountrySelect({ setCountry, value }: Props) {
  return <CustomSelect options={options} value={value} setValue={setCountry} placeholder="Select country" />;
}
