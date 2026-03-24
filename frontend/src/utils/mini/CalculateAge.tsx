/* Calculates age of the person user is connected to */
export default function CalculateAge(dateOfBirth: string): number {
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