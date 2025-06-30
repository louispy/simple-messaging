export interface JwtPayload {
  sub: string;
  username: string;
  roles: string[];
}

export interface JwtValidationPayload {
  userId: string;
  username: string;
  roles: string[];
}
