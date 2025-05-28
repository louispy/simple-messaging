import { IsNumber, IsOptional } from "class-validator";

export class BaseRequest {
  @IsNumber()
  @IsOptional()
  userId: string;
}