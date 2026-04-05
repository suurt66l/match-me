/* Calculates age from a date of birth "YYYY-MM-DD", returns it as a string */
export default function CalculateAge(dateOfBirth: string): string {
  const today = new Date();
  // Backend sends LocalDate as "YYYY-MM-DD" string (Spring Boot Jackson default)
  const [year, month, day] = dateOfBirth.split("-").map(Number);
  const birth = new Date(year, month - 1, day);

  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthday = (today.getMonth() > birth.getMonth()) ||
                         (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age--;
  }

  return String(age);
}
