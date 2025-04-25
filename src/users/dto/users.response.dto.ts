import { PaginationResponse } from '../../common/dto/pagination.response';

export interface CreateUserResponse {
  id: string;
  message: string;
}

interface UserDTO {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface GetUserResponse {
  data: UserDTO[];
  paging: PaginationResponse;
}

export interface GetOneUserResponse {
  data: UserDTO;
  message: string;
}

export interface UpdateUserResponse {
  data: UserDTO;
  message: string;
}

export interface DeleteUserResponse {
  data: UserDTO;
  message: string;
}
