import {
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import mongoose from 'mongoose';
import { PaginateDto } from './dtos/paginate.dto';
import { MongoIdDto } from 'src/shared/dtos/mongo-id.dto';
import { LikesService } from 'src/likes/likes.service';
import { UserService } from 'src/user/user.service';
import { PostCommentDto } from '../shared/dtos/add-post-comment.dto';
import { CommentsService } from 'src/comments/comments.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: mongoose.Model<Post>,
    private likesService: LikesService,
    private usersService: UserService,
    private commentsService: CommentsService,
  ) {}

  async create(postDto: CreatePostDto, userId: MongoIdDto) {
    const { title, content } = postDto;
    const post = new this.postModel({ user: userId, title, content });
    await post.save();
    await post.populate('user', ['name', 'image']);

    return {
      message: 'Post created successfully',
      post,
    };
  }

  async findAll(paginateDto: PaginateDto): Promise<object> {
    try {
      const { page = 1, limit = 20 } = paginateDto;
      const skip = (page - 1) * limit;

      const posts = await this.postModel
        .find({})
        .populate('user', ['name', 'image'])
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

      const totalPosts = await this.postModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
      const hasNextPage = page < totalPages ? true : false;
      const hasPreviousPage = page > 1 ? true : false;
      return {
        posts,
        page,
        documentsPerPage: limit,
        hasPreviousPage,
        hasNextPage,
        totalPages,
        totalPosts,
      };
    } catch (error) {
      console.log('Error while getting all posts : ', error);
      throw new InternalServerErrorException(
        'Something unexpected occurred while fetching all posts',
      );
    }
  }

  async findByUser(userId, paginateDto: PaginateDto) {
    try {
      //checking if user exists or not, if not exists usersService will throw not found exception
      await this.usersService.findById(userId);

      const { page = 1, limit = 20 } = paginateDto;
      const skip = (page - 1) * limit;
      const posts = await this.postModel
        .find({ user: new mongoose.Types.ObjectId(userId) })
        .populate('user', ['name', 'image'])
        .skip(skip)
        .limit(limit)
        .sort('-createdAt');

      const totalPosts = await this.postModel.countDocuments({
        user: new mongoose.Types.ObjectId(userId),
      });
      const totalPages = Math.ceil(totalPosts / limit);
      const hasNextPage = page < totalPages ? true : false;
      const hasPreviousPage = page > 1 ? true : false;
      return {
        posts,
        page,
        documentsPerPage: limit,
        hasPreviousPage,
        hasNextPage,
        totalPages,
        totalPosts,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while getting user posts : ', error);
        throw new InternalServerErrorException(
          'Something unexpected occurred while fetching user posts',
        );
      }
    }
  }

  async findById(postId: string) {
    try {
      const post = await this.postModel
        .findById(postId)
        .populate('user', ['name', 'image']);

      if (!post) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }
      return post;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while fetching post : ', error);
        throw new InternalServerErrorException(
          'Something unexpected occurred while getting post data',
        );
      }
    }
  }

  async delete(userId: mongoose.Types.ObjectId, postId: string) {
    try {
      const post = await this.findById(postId);

      if (post.user._id.toString() !== userId.toString()) {
        throw new ForbiddenException(
          'You are not authorized to delete this post !!',
        );
      }

      await this.postModel.deleteOne({
        _id: new mongoose.Types.ObjectId(postId),
      });

      return {
        message: 'Post deleted successfully',
        deletedPost: post,
      };
    } catch (error) {
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }
      console.log('Error while deleting post : ', error);

      throw new InternalServerErrorException(
        'An error occurred while processing the request.',
      );
    }
  }

  async likePost(
    userId: mongoose.Types.ObjectId,
    postId: string,
  ): Promise<Post> {
    try {
      const existingPost = await this.postModel.findById(postId);
      if (!existingPost) {
        throw new NotFoundException(`Post with id ${postId} not found`);
      }
      const likeResponse = await this.likesService.likePost(userId, postId);
      if (likeResponse === 'Like added') {
        const post = await this.postModel.findByIdAndUpdate(
          postId,
          { $inc: { likesCount: +1 } },
          { new: true },
        );
        return post;
      } else if (likeResponse === 'Like removed') {
        const post = await this.postModel.findByIdAndUpdate(
          postId,
          { $inc: { likesCount: -1 } },
          { new: true },
        );
        return post;
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof HttpException
      ) {
        throw error;
      }
      console.log('Error while like post : ', error);
      throw new InternalServerErrorException(
        'Something unexpected occurred while like post',
      );
    }
  }

  async addComment(
    userId: mongoose.Types.ObjectId,
    postId: string,
    postCommentDto: PostCommentDto,
  ): Promise<object> {
    try {
      await this.findById(postId);
      const newComment = await this.commentsService.createPostComment(
        userId,
        postId,
        postCommentDto,
      );

      await this.postModel.findByIdAndUpdate(postId, {
        $inc: { commentsCount: 1 },
      });
      return {
        message: 'Comment added',
        newComment,
      };
    } catch (error) {
      console.log('Error while adding comment to post : ', error);
      throw new InternalServerErrorException(
        'Something unexpected occurred while adding comment',
      );
    }
  }

  async deleteComment(userId: mongoose.Types.ObjectId, commentId: string) {
    try {
      const res = await this.commentsService.deletePostComment(
        userId,
        commentId,
      );
      await this.postModel.findByIdAndUpdate(res.postId, {
        $inc: { commentsCount: -1 },
      });

      return res;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      } else {
        console.log('Error while deleting comment :', error);
        throw new InternalServerErrorException(
          `Something unexpected occurred while deleting comment`,
        );
      }
    }
  }
}
