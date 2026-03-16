interface Props {
    setLookingFor: (value: string) => void;
}

export default function LookingForSelect({setLookingFor} : Props) {
    return(
        <select id="looking-for"
                name="looking-for"
                className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-2 -outline-offset-1 outline-white/25 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-amber-700 sm:text-sm/6" 
                onChange={(event) => setLookingFor(event.target.value) }>
            <option value="">Select purpose</option>
            <option value="for-play">Play together</option>
            <option value="for-friendship">Friendship</option>
            <option value="for-chat">Just to chat</option>
            <option value="for-irl-relations">Relationships IRL</option>
        </select>
    );
}