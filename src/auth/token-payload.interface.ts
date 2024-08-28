import { Role } from '../users/schema/role.type';

export interface TokenPayload {
  userId: string;
  role: Role
}