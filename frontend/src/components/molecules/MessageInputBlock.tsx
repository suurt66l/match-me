interface Props {
    input: string;
    onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export default function MessageInputBlock({input, onInputChange, onSend, onKeyDown}: Props){
    return(
        <div className="bg-amber-400 px-4 py-3 shrink-0 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={onInputChange}
              onKeyDown={onKeyDown}
              placeholder="Type a message..."
              className="flex-1 rounded-lg bg-white/20 px-4 py-2 text-sm text-amber-950 placeholder-amber-700 outline-none focus:bg-white/30"
            />
            <button
              onClick={onSend}
              className="rounded-lg bg-amber-950 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-900"
            >
              Send
            </button>
        </div>
    );
}