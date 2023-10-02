import { IsMongoId, IsNotEmpty, Length } from 'class-validator';

export class PostCommentDto {
  @IsNotEmpty()
  @Length(6, 100)
  content: string;
}
