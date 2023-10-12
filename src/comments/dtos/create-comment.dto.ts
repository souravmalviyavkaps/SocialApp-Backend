import { IsNotEmpty, Length } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty()
  @Length(6, 100)
  content: string;
}
