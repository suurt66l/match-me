import CustomSelect from "./CustomSelect";

interface Props {
  setLookingFor: (value: string) => void;
  value: string;
}

const options = [
  { value: "for-play", label: "Play together" },
  { value: "for-friendship", label: "Friendship" },
  { value: "for-chat", label: "Just to chat" },
  { value: "for-irl-relations", label: "Relationships IRL" },
];

export default function LookingForSelect({ setLookingFor, value }: Props) {
  return <CustomSelect options={options} value={value} setValue={setLookingFor} placeholder="Select purpose" />;
}
