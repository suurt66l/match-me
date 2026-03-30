import CreatableSelect from "react-select/creatable";

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
    <CreatableSelect
        options={options}
        value={value}
        onChange={(newValue) => onChange(newValue as Option)}
        placeholder={placeholder}
        unstyled
        classNames={{
            control: () => "bg-amber-500 border-2 border-white/25 rounded-lg gap-1 py-1 px-1 hover:text-amber-00",
            menu: () => "bg-amber-950 border-5 border-amber-900 rounded-lg mt-1",
            option: () => "px-3 py-2 text-white hover:bg-amber-900 cursor-pointer",
            singleValue: () => "text-white rounded px-1",
            placeholder: () => "text-white",
            input: () => "text-white",
      }}
    />
  );
}