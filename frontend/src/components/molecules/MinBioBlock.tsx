import Avatar from "../atoms/Avatar";
import Identity from "../atoms/Identity";

interface Props {
    avatarUrl: string | null
    nickname: string;
    country: string;
    age: number | null;
}

export default function MinBioBlock({avatarUrl, nickname, country, age}: Props){
    return(
      <div className="flex items-center gap-4">
        <Avatar avatarUrl={avatarUrl}/>
        <div>
          <Identity 
            nickname={nickname}
            country={country}
            age={age}
          />
        </div>
      </div>

    )
}