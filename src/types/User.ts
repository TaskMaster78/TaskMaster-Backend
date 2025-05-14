export interface IUser {
  id?: string;
  username: string;
  password: string;
  role: "student" | "admin";
  name: string;
  universityId: string;
}
