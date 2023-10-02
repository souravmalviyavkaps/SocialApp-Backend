import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { CommentDocument } from 'src/comments/schemas/comment.schema';
import { PostDocument } from 'src/posts/schemas/post.schema';
import { UserDocument } from 'src/user/schemas/user.schema';

export type LikeDocument = HydratedDocument<Like>;

@Schema({
  timestamps: true,
})
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: UserDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null })
  post: PostDocument;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  comment: CommentDocument;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
