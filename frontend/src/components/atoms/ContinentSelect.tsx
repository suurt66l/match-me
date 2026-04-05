import CustomSelect from "./CustomSelect";
import { CONTINENTS } from "../../data/continents";

interface Props {
  setCountry: (value: string) => void;
  value: string;
}

const options = CONTINENTS.map(c => ({ value: c, label: c }));

export default function ContinentSelect({ setCountry, value }: Props) {
  return <CustomSelect options={options} value={value} setValue={setCountry} placeholder="Select country" />;
}
