import Button from "../atoms/Button";
import ChatLink from "../atoms/ChatLink";
import ConnectionsLink from "../atoms/ConnectionsLink";
import MatcherLink from "../atoms/MatcherLink";
import ProfileLink from "../atoms/ProfileLink";
import SignOutButton from "../atoms/SignOutButton";
import TestLink from "../atoms/TestLink";

export default function NavMenu () {
    return (
        <div>
            <MatcherLink />
            <ConnectionsLink />
            <ChatLink />
            <ProfileLink />
            <TestLink />
            <SignOutButton />
        </div>
    );
}