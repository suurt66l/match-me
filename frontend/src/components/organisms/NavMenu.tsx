import Button from "../atoms/Button";
import MatcherLink from "../atoms/MatcherLink";
import SignOutButton from "../atoms/SignOutButton";
import TestLink from "../atoms/TestLink";

export default function NavMenu () {
    return (
        <div>
            <Button label="Matcher" link="/matcher"/>
            <MatcherLink />
            <TestLink />
            <SignOutButton />
        </div>
    );
}