import { useState, useRef, useEffect } from "react";

// One option in the dropdown looks like: { value: "pc", label: "PC" }
interface Option {
  value: string;
  label: string;
}

// - options: the list of choices to show
// - value: which option is currently selected
// - setValue: function to call when user picks something
// - placeholder: text to show when nothing is selected yet
interface Props {
  options: Option[];
  value: string;
  setValue: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, value, setValue, placeholder = "Select..." }: Props) {

  // isOpen controls whether the dropdown list is visible or hidden
  const [open, setOpen] = useState(false);

  // boxRef is used as a "pointer"/anchor to the dropdown HTML element
  const boxRef = useRef<HTMLDivElement>(null);

  // Add listeners to the page on the first render
  useEffect(() => {
    // If the click is outside our dropdown box — close it
    function closeIfClickedOutside(event: MouseEvent) {
      const box = boxRef.current;
      if (!box) return; // TS -- relax

      //Did user clicked inside the selector
      const userClickedInsideBox = box.contains(event.target as Node);
      if (!userClickedInsideBox) {
        setOpen(false);
      }
    }

    // Start listening for clicks
    document.addEventListener("mousedown", closeIfClickedOutside);

    // Stop listening when the component is removed from the page
    return () => {
      document.removeEventListener("mousedown", closeIfClickedOutside);
    };
  }, []);

  // Find the full option object that matches the current value
  // So we can show the label (e.g. "PC") instead of the value (e.g. "pc")
  const selectedOption = options.find(option => option.value === value);

  function handleButtonClick() {
    setOpen(!open);
  }

  function handleOptionClick(optionValue: string) {
    setValue(optionValue);
    setOpen(false);
  }

  return (
    <div ref={boxRef} className="relative">

      {/* The button that opens/closes the dropdown */}
      <button
        type="button"
        onClick={handleButtonClick}
        className="flex w-full items-center justify-between rounded-md bg-white/5 px-3 py-1.5 text-sm/6 text-white outline-2 -outline-offset-1 outline-white/25 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700"
      >
        {/* Show selected label or placeholder */}
        <span className={selectedOption ? "text-white" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Arrow icon — rotates when dropdown is open */}
        <svg
          className={`h-4 w-4 text-white/50 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Renders dropdown list */}
      {open && (
        <ul className="absolute z-10 mt-1 w-full rounded-md bg-amber-950 py-1 shadow-lg max-h-60 overflow-y-auto">
          {options.map(function(option) {
            return (
              <li
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                
                // Highlight the currently selected option with a darker background
                className={`cursor-pointer px-3 py-1.5 text-sm text-white hover:bg-amber-900 
                  ${value === option.value ? "bg-amber-800" : ""}`}
              >
                {option.label}
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}