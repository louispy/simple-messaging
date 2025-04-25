import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DefaultMongoIdParams {
  @IsNotEmpty()
  @IsMongoId()
  id: string;
}
