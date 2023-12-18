import { IsOptional, IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  nameRu: string;

  @IsString()
  @IsOptional()
  contentRu: string;
}
