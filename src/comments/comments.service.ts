import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './schemas/comment.schema';
import mongoose from 'mongoose';
import { PostCommentDto } from '../shared/dtos/add-post-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name)
    private commentModel: mongoose.Model<Comment>,
  ) {}

  async createPostComment(
    userId: mongoose.Types.ObjectId,
    postId: string,
    postCommentDto: PostCommentDto,
  ) {
    const { content } = postCommentDto;
    const newComment = await this.commentModel.create({
      user: userId,
      post: new mongoose.Types.ObjectId(postId),
      content,
    });
    return newComment;
  }

  async deletePostComment(userId: mongoose.Types.ObjectId, commentId: string) {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    if (!comment.user._id.equals(userId)) {
      throw new ForbiddenException(
        'You are not authorized to delete this comment',
      );
    }
    const deletedComment = await this.commentModel.findByIdAndDelete(commentId);
    await this.commentModel.deleteMany({ parentComment: commentId });
    return {
      deletedComment,
      postId: deletedComment.post._id,
      message: 'Comment removed',
    };
  }
}
