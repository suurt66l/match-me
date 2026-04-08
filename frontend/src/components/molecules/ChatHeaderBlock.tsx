interface Props {
    isTyping: boolean;
    activeUserName: string | null;
    onBack: () => void;
}

export default function ChatHeaderBlock({onBack, activeUserName, isTyping}: Props){
    return(
          <div className="bg-amber-500 px-4 py-3 shrink-0 flex items-center gap-3">
            <button
              onClick={onBack}
              className="sm:hidden w-8 h-8 flex items-center justify-center rounded-full text-amber-300 bg-amber-950 hover:bg-amber-800 transition-colors"
              aria-label="Back"
            >
              ←
            </button>

            {/* Displays message if another user is typing message*/}
            <div>
              <p className="text-amber-950 font-bold">{activeUserName}</p>
              {isTyping && <p className="text-amber-800 text-xs">typing...</p>}
            </div>
          </div>
    );

}