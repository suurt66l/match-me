import Select from "react-select";

interface Option {
  readonly label: string;
  readonly value: string;
}

interface Props {
  options: Option[];
  value: Option | null;
  placeholder?: string;
  onChange: (value: Option) => void;
}

export default function SingleSelect({ options, value, placeholder = "Select...", onChange }: Props) {
  return (
    <Select
        options={options}
        value={value}
        onChange={(newValue) => onChange(newValue as Option)}
        placeholder={placeholder}
        unstyled
        classNames={{
            control: () => "bg-amber-200 border-2 border-amber-400 rounded-lg py-1 px-1",
            menu: () => "bg-amber-950 border-5 border-amber-900 rounded-lg mt-1",
            option: () => "px-3 py-2 text-white hover:bg-amber-800 cursor-pointer",
            singleValue: () => "text-amber-950 rounded px-1",
            placeholder: () => "text-amber-600",
            input: () => "text-amber-950",
      }}
    />
  );
}