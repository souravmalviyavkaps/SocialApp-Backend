import { IsMongoId, IsOptional } from 'class-validator';
import mongoose from 'mongoose';

export class MongoIdDto {
  @IsOptional()
  @IsMongoId()
  userId: string;

  @IsOptional()
  @IsMongoId()
  postId: string;

  @IsOptional()
  @IsMongoId()
  commentId: string;

  @IsOptional()
  @IsMongoId()
  likeId: string;

  @IsOptional()
  @IsMongoId()
  shareId: string;
}
