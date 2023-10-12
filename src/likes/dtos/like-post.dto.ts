import { IsMongoId } from 'class-validator';

export class LikePostDto {
  @IsMongoId()
  postId: string;
}
