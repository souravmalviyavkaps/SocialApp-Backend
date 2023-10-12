import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import mongoose from 'mongoose';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { PostsService } from 'src/posts/posts.service';
import { DeleteCommentDto } from './dtos/delete-comment-dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: mongoose.Model<Comment>,
    private postsService: PostsService,
  ) {}

  async findById(commentId: string | mongoose.Types.ObjectId) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException(`Comment with id ${commentId} no found`);
    }
    return comment;
  }

  async createPostComment(
    userId: mongoose.Types.ObjectId,
    postId: string | mongoose.Types.ObjectId,
    createCommentDto: CreateCommentDto,
  ) {
    try {
      //checks if post exist or not
      await this.postsService.findById(postId);

      const { content } = createCommentDto;
      const newComment = await this.commentModel.create({
        user: userId,
        post: new mongoose.Types.ObjectId(postId),
        content,
      });
      const post = await this.postsService.increaseCommentsCount(postId);

      return {
        message: 'Comment added to post',
        newComment,
        post,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while adding comment to post : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while adding commnet to post',
        );
      }
    }
  }

  async deletePostComment(
    userId: mongoose.Types.ObjectId,
    deleteCommentDto: DeleteCommentDto,
  ) {
    try {
      const { commentId } = deleteCommentDto;
      const comment = await this.commentModel.findById(commentId);
      if (!comment) {
        throw new NotFoundException(`Comment with id ${commentId} not found`);
      }
      if (!comment.user._id.equals(userId)) {
        throw new ForbiddenException(
          'You are not authorized to delete this comment',
        );
      }

      const deletedComment = await this.commentModel.findByIdAndDelete(
        commentId,
      );
      //delete all the replies/childComments if exists
      const { deletedCount: deletedRepliesCount } =
        await this.commentModel.deleteMany({
          parentComment: commentId,
        });

      const post = await this.postsService.decreaseCommentsCount(
        deletedComment.post._id,
        deletedRepliesCount + 1, //+1 to decrease count for comment itself
      );
      return {
        message: 'Comment deleted',
        deletedComment,
        post,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while deleting comment : ', error);
        throw new InternalServerErrorException(
          'Something went wrong while deleting comment',
        );
      }
    }
  }

  async createCommentReply(
    userId: mongoose.Types.ObjectId,
    commentId: mongoose.Types.ObjectId | string,
    createCommentDto: CreateCommentDto,
  ) {
    try {
      const { content } = createCommentDto;
      //check if comment exist or not
      const existingComment = await this.commentModel.findById(commentId);
      if (!existingComment) {
        throw new NotFoundException(`Comment with id ${commentId} not found`);
      }

      const newReply = await this.commentModel.create({
        user: userId,
        post: existingComment.post._id,
        parentComment: new mongoose.Types.ObjectId(commentId),
        content,
      });

      const post = await this.postsService.increaseCommentsCount(
        newReply.post._id,
      );
      return {
        message: 'Reply added',
        newReply,
        post,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
    }
  }

  async increaseLikesCount(commentId: string | mongoose.Types.ObjectId) {
    const comment = await this.commentModel.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: +1 } },
      { new: true },
    );
    return comment;
  }

  async decreaseLikesCount(commentId: string | mongoose.Types.ObjectId) {
    const comment = await this.commentModel.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } },
      { new: true },
    );
    return comment;
  }
}
