import { User } from "./user.model";
import { Role } from "./role.model";

export interface UserAndRole extends User {
  role: Role
}