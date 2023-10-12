import { IsMongoId, IsNotEmpty } from 'class-validator';

export class LikeCommentDto {
  @IsMongoId()
  @IsNotEmpty()
  commentId: string;
}
