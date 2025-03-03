// src/app/models/user.model.ts
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  lastLogin?: string;
  isActive?: boolean;
}
