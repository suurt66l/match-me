import Avatar from "../atoms/Avatar";
import Identity from "../atoms/Identity";

interface Props {
    avatarUrl: string | null;
    nickname: string;
    country: string;
    city?: string;
    age: string | null;
    gender?: string;
}

export default function MinBioBlock({avatarUrl, nickname, country, city, age, gender}: Props){
    return(
      <div className="flex items-center gap-4">
        <Avatar avatarUrl={avatarUrl}/>
        <div>
          <Identity
            nickname={nickname}
            country={country}
            city={city}
            age={age}
            gender={gender}
          />
        </div>
      </div>
    );
}
