import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../utils/AuthContext";
import DismissButton from "../atoms/DismissButton";
import MessageButton from "../atoms/PersonalMessageButton";
import PersonalMessageButton from "../atoms/PersonalMessageButton";


interface Connection {
  id: number;
  nickname: string;
  avatarUrl: string | null;
  country: string;
  dateOfBirth: string;
}

export default function ConnectionsSection(){
  const [connections, setConnections] = useState<Connection[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  /* Removes connection with person */
  async function removeConnection(id: number) {
    try {
        await fetch(`http://localhost:8080/api/connections/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` },
        });

        const updatedConnections = connections.filter(item => item.id !== id)
        setConnections(updatedConnections);
    } catch {
      console.log("Server is unreachable!");
    }
  }

  /* Load connection on connecting to the page and token changes */
  useEffect(() => {
    async function loadConnections() {
      try {
        const response = await fetch("http://localhost:8080/api/connections", {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setConnections(data);
        }
      } catch {
        console.log("Server is unreachable!");
      }
    }
    loadConnections();
  }, [token]);
  
  /* In case if there is no connections */
  if(connections.length <= 0){
    return(<p className="text-amber-800">No connections yet. Go find some matches!</p>)
  }

return    (
        <div className="flex flex-col gap-3 max-w-lg">
          {connections.map(user => (
            <div key={user.id} className="flex items-center gap-4 bg-amber-500 rounded-xl px-5 py-4">

              <div className="w-12 h-12 rounded-full bg-amber-950 overflow-hidden shrink-0">
                <img
                  src={user.avatarUrl ?? "/assets/default-avatar.svg"}
                  alt={user.nickname}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1">
                <p className="text-amber-950 font-bold">{user.nickname}</p>
                <p className="text-amber-800 text-sm">
                  {user.country}{user.dateOfBirth ? `, ${calcAge(user.dateOfBirth)}` : ""}
                </p>
              </div>

            <PersonalMessageButton redirectToPm={() => navigate(`/chat?with=${user.id}`) }/>
            <DismissButton handleDismiss={ () => removeConnection(user.id) }/>
            </div>
          ))}
        </div>
      )
}

/* Calculates age of the person user is connected to */
function calcAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);

  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthday = (today.getMonth() > birth.getMonth()) ||
                         (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age--
  };

  return age;
}