interface Props {
    nickname: string;
    country: string;
    city?: string;
    age: string | null;
    gender?: string;
}

export default function Identity({nickname, country, city, age, gender} : Props){
    const location = [city, country].filter(Boolean).join(", ");
    return(
        <>
            <p className="text-amber-950 font-bold text-lg">{nickname}</p>
            <p className="text-amber-800 text-sm">{location}{age !== null ? `, ${age}` : ""}</p>
            {gender && <p className="text-amber-700 text-sm">{gender}</p>}
        </>
    );
}