import { IsNotEmpty, IsNumber } from 'class-validator';

class ObjectWithIdDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}

export default ObjectWithIdDto;
