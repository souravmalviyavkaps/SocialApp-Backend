import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from './schemas/like.schema';
import mongoose from 'mongoose';
import { PostsService } from 'src/posts/posts.service';
import { LikePostDto } from './dtos/like-post.dto';
import { CommentsService } from 'src/comments/comments.service';
import { LikeCommentDto } from './dtos/like-comment.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: mongoose.Model<Like>,
    private postsService: PostsService,
    private commentsService: CommentsService,
  ) {}

  async likePost(userId: mongoose.Types.ObjectId, likePostDto: LikePostDto) {
    try {
      const { postId } = likePostDto;
      //check if post exists or not
      await this.postsService.findById(postId);

      const existingLike = await this.likeModel.findOne({
        user: userId,
        post: new mongoose.Types.ObjectId(postId),
      });
      if (existingLike) {
        // User has already liked this post
        await this.likeModel.findByIdAndDelete(existingLike._id);
        const post = await this.postsService.decreaseLikesCount(postId);
        return {
          message: 'Like removed',
          post,
        };
      } else {
        await this.likeModel.create({
          user: userId,
          post: new mongoose.Types.ObjectId(postId),
        });
        const post = await this.postsService.increaseLikesCount(postId);
        return {
          message: 'Like added',
          post,
        };
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while adding like to post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while adding like to post',
        );
      }
    }
  }

  async likeComment(
    userId: mongoose.Types.ObjectId,
    likeCommentDto: LikeCommentDto,
  ) {
    try {
      const { commentId } = likeCommentDto;
      //checks if comment exists or not
      await this.commentsService.findById(commentId);

      const existingLike = await this.likeModel.findOne({
        user: userId,
        comment: new mongoose.Types.ObjectId(commentId),
      });

      if (existingLike) {
        //like to this comment already exists
        await this.likeModel.findByIdAndDelete(existingLike._id);
        const comment = await this.commentsService.decreaseLikesCount(
          commentId,
        );
        return {
          message: 'Like removed',
          comment,
        };
      } else {
        await this.likeModel.create({
          user: userId,
          comment: new mongoose.Types.ObjectId(commentId),
        });
        const comment = await this.commentsService.increaseLikesCount(
          commentId,
        );
        return {
          message: 'Like added',
          comment,
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while adding like to comment : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while adding like to comment',
        );
      }
    }
  }
}
