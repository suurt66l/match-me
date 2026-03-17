import CustomSelect from "./CustomSelect";

interface Props {
  setGender: (value: string) => void;
  value: string;
}

const options = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non-binary", label: "Non-binary" },
];

export default function GenderSelect({ setGender, value }: Props) {
  return <CustomSelect options={options} value={value} setValue={setGender} placeholder="Select gender" />;
}
