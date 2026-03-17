import NicknameInput from "../atoms/NicknameInput";
import NicknameLabel from "../atoms/NicknameLabel";
interface Props {
  setNickname: (value: string) => void;
  value: string;
}

export default function NicknameInputBlock({setNickname, value} : Props) {
    return (
            <div>
              <NicknameLabel />
              <div className="mt-2">
                <NicknameInput
                  setNickname={setNickname}
                  value={value}
                />
              </div>
            </div>
    )
};