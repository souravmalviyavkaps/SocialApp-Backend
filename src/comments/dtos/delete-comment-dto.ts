import { IsMongoId, IsNotEmpty } from 'class-validator';

export class DeleteCommentDto {
  @IsNotEmpty()
  @IsMongoId()
  commentId: string;
}
