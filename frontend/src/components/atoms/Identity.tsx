interface Props {
    nickname: string;
    country: string;
    age: string | null;
    gender?: string;
}

export default function Identity({nickname, country, age, gender} : Props){
    return(
        <>
            <p className="text-amber-950 font-bold text-lg">{nickname}</p>
            <p className="text-amber-800 text-sm">{country}{age !== null ? `, ${age}` : ""}</p>
            {gender && <p className="text-amber-700 text-sm">{gender}</p>}
        </>
    );
}