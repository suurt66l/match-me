import ChatLink from "../atoms/ChatLink";
import ConnectionsLink from "../atoms/ConnectionsLink";
import MatcherLink from "../atoms/MatcherLink";
import ProfileLink from "../atoms/ProfileLink";
import SignOutButton from "../atoms/SignOutButton";

interface Props {
    onMenuToggle?: () => void;
}

export default function NavMenu ( {onMenuToggle} : Props) {
    return (
        <div>
            <MatcherLink onMenuToggle = {onMenuToggle}/>
            <ConnectionsLink onMenuToggle = {onMenuToggle}/>
            <ChatLink onMenuToggle = {onMenuToggle}/>
            <ProfileLink onMenuToggle = {onMenuToggle}/>
            <SignOutButton />
        </div>
    );
}