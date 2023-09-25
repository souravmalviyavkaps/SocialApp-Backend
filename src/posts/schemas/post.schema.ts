import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/user/schemas/user.schema';

export type PostDocument = HydratedDocument<Post>;

@Schema({
  timestamps: true,
})
export class Post {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  user: User;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop([String])
  images: string[];
}

export const PostSchema = SchemaFactory.createForClass(Post);
