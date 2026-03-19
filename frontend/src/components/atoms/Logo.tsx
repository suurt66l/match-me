import joystick from "../../assets/joystick.svg";

export default function Logo () {
    return (
<div className="flex items-center gap-2">
      {/* circle background */}
      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-fuchsia-800">
        <img
            alt="Logo"
            src={joystick}
            className="h-6 w-6"
          />
       
      </div>

      <span className="text-lg font-semibold">GameMe</span>
    </div>
    )
}