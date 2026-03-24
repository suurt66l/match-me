import CustomSelect from "./CustomSelect";
import { timeZones } from "../../data/timezones";

interface Props {
  setTimeZone: (value: string) => void;
  value: string;
}

const options = timeZones.map(tz => ({ value: tz, label: tz }));

export default function TimeZoneSelect({ setTimeZone, value }: Props) {
  return <CustomSelect options={options} setValue={setTimeZone} value={value} placeholder="Select timezone..." />;
}
