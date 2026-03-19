import { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface Props {
  options: Option[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, value, setValue, placeholder = "Select..." }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex w-full items-center justify-between rounded-md bg-white/5 px-3 py-1.5 text-sm/6 text-white outline-2 -outline-offset-1 outline-white/25 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700"
      >
        <span className={selected ? "text-white" : "text-gray-500"}>
          {selected ? selected.label : placeholder}
        </span>
        <svg
          className={`h-4 w-4 text-white/50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-md bg-amber-950 py-1 shadow-lg max-h-60 overflow-y-auto">
          {options.map(option => (
            <li
              key={option.value}
              onClick={() => { setValue(option.value); setOpen(false); }}
              className={`cursor-pointer px-3 py-1.5 text-sm text-white hover:bg-amber-900 ${value === option.value ? "bg-amber-800" : ""}`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
