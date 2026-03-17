import CustomSelect from "./CustomSelect";

interface Props {
  setPlatform: (value: string) => void;
  value: string;
}

const options = [
  { value: "pc", label: "PC" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "nintendo", label: "Nintendo" },
  { value: "other", label: "Other" },
];

export default function PlatformSelect({ setPlatform, value }: Props) {
  return <CustomSelect options={options} value={value} setValue={setPlatform} placeholder="Select platform" />;
}
