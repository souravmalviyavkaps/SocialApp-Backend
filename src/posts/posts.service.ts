import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dtos/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import mongoose from 'mongoose';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { MongoIdDto } from 'src/common/dtos/mongo-id.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: mongoose.Model<Post>,
    private usersService: UserService,
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

  async findAll(paginationDto: PaginationDto): Promise<object> {
    try {
      const { page = 1, limit = 20 } = paginationDto;
      const skip = (page - 1) * limit;

      // const posts = await this.postModel
      //   .find({})
      //   .populate('user', ['name', 'image'])
      //   .skip(skip)
      //   .limit(limit)
      //   .sort('-createdAt');

      const posts = await this.postModel.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            pipeline: [
              {
                $project: {
                  name: true,
                  image: true,
                },
              },
            ],
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $lookup: {
            from: 'comments',
            localField: '_id',
            foreignField: 'post',
            pipeline: [
              {
                $match: {
                  parentComment: null,
                },
              },
              {
                $project: {
                  content: true,
                  likesCount: true,
                },
              },
              { $sort: { createdAt: -1 } },
              { $limit: 3 },
            ],
            as: 'comments',
          },
        },

        { $sort: { createdAt: -1 } },
        { $limit: +limit },
        { $skip: +skip },
      ]);

      const totalPosts = await this.postModel.countDocuments();
      const totalPages = Math.ceil(totalPosts / limit);
      const hasNextPage = page < totalPages ? true : false;
      const hasPreviousPage = page > 1 ? true : false;
      return {
        posts,
        page,
        limit,
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

  async findByUser(userId: string, paginationDto: PaginationDto) {
    try {
      //checking if user exists or not, if not exists usersService will throw not found exception
      await this.usersService.findById(userId);

      const { page = 1, limit = 20 } = paginationDto;
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
        limit,
        hasPreviousPage,
        hasNextPage,
        totalPages,
        totalDocuments: totalPosts,
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

  async findById(postId: string | mongoose.Types.ObjectId) {
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

  async increaseLikesCount(postId: mongoose.Types.ObjectId | string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $inc: { likesCount: +1 },
      },
      { new: true },
    );
    return post;
  }

  async decreaseLikesCount(postId: mongoose.Types.ObjectId | string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $inc: { likesCount: -1 },
      },
      { new: true },
    );
    return post;
  }

  async increaseCommentsCount(postId: mongoose.Types.ObjectId | string) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $inc: { commentsCount: +1 },
      },
      { new: true },
    );
    return post;
  }

  async decreaseCommentsCount(
    postId: mongoose.Types.ObjectId | string,
    decreaseCount: number,
  ) {
    const post = await this.postModel.findByIdAndUpdate(
      postId,
      {
        $inc: { commentsCount: -decreaseCount },
      },
      { new: true },
    );
    return post;
  }
}
