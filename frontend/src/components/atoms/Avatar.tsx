export default function Avatar({avatarUrl} : {avatarUrl: string | null}){
    return(
        <div className="w-14 h-14 rounded-full bg-amber-950 overflow-hidden shrink-0">
            <img
                src={avatarUrl ?? "/assets/default-avatar.svg"}
                className="w-full h-full object-cover"
            />
        </div>
    );
}