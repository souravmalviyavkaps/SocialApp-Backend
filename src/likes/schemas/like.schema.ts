import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Comment } from 'src/comments/schemas/comment.schema';
import { Post } from 'src/posts/schemas/post.schema';
import { User } from 'src/user/schemas/user.schema';

export type LikeDocument = HydratedDocument<Like>;

@Schema({
  timestamps: true,
})
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null })
  post: Post;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null })
  comment: Comment;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
