import NicknameInput from "../atoms/NicknameInput";
import NicknameLabel from "../atoms/NicknameLabel";
interface Props {
  value: string;
  setNickname: (value: string) => void;
}

export default function NicknameInputBlock({value, setNickname} : Props) {
    return (
            <div>
              <NicknameLabel />
              <div className="mt-2">
                <NicknameInput
                  value={value}
                  setNickname={setNickname}
                />
              </div>
            </div>
    )
};