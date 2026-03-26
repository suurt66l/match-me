/* Calculates age from a date of birth, returns it as a string */
export default function CalculateAge(dateOfBirth: number[]): string {
  const today = new Date();
  // Backend sends LocalDate as [year, month, day], month is 1-based so we subtract 1
  const birth = new Date(dateOfBirth[0], dateOfBirth[1] - 1, dateOfBirth[2]);

  let age = today.getFullYear() - birth.getFullYear();

  const hasHadBirthday = (today.getMonth() > birth.getMonth()) ||
                         (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age--;
  }

  return String(age);
}
