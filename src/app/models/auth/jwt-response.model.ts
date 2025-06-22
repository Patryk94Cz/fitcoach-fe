export interface JwtResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  role: string;
  expiresIn: number;
}
