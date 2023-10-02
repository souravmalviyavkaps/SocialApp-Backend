import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from './schemas/like.schema';
import mongoose from 'mongoose';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: mongoose.Model<Like>,
  ) {}

  async likePost(userId: mongoose.Types.ObjectId, postId: string) {
    try {
      const existingLike = await this.likeModel.findOne({
        user: userId,
        post: new mongoose.Types.ObjectId(postId),
      });
      if (existingLike) {
        console.log('User has already liked this post');
        await this.likeModel.findOneAndDelete(existingLike._id);
        return 'Like removed';
      } else {
        await this.likeModel.create({
          user: userId,
          post: new mongoose.Types.ObjectId(postId),
        });

        return 'Like added';
      }
    } catch (error) {
      console.log('Error while like post : ', error);
      throw new HttpException(error.message, 400);
    }
  }
}
