import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { PostDocument } from 'src/posts/schemas/post.schema';
import { UserDocument } from 'src/user/schemas/user.schema';

export type CommentDocument = HydratedDocument<Comment>;

@Schema({
  timestamps: true,
})
export class Comment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: UserDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true })
  post: PostDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  parentComment: CommentDocument;

  @Prop({ required: true })
  content: string;

  @Prop({ default: 0 })
  likesCount: number;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
