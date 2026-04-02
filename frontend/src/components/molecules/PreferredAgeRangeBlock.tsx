import PreferredAgeLabel from "../atoms/PreferredAgeLabel";

interface Props {
  minAge: string;
  maxAge: string;
  setMinAge: (value: string) => void;
  setMaxAge: (value: string) => void;
}

export default function PreferredAgeRangeBlock({ minAge, maxAge, setMinAge, setMaxAge }: Props) {
    return (
        <div>
          <PreferredAgeLabel />
          <div className="mt-2 flex gap-3 items-center">
            <input
              type="number"
              min={18}
              max={99}
              placeholder="Min"
              value={minAge}
              onChange={e => setMinAge(e.target.value)}
              className="w-full rounded-lg border-2 border-white/25 bg-amber-500 px-3 py-1.5 text-white placeholder-white text-sm focus:outline-none"
            />
            <span className="text-gray-100 text-sm shrink-0">to</span>
            <input
              type="number"
              min={18}
              max={99}
              placeholder="Max"
              value={maxAge}
              onChange={e => setMaxAge(e.target.value)}
              className="w-full rounded-lg border-2 border-white/25 bg-amber-500 px-3 py-1.5 text-white placeholder-white text-sm focus:outline-none"
            />
          </div>
        </div>
    );
}
