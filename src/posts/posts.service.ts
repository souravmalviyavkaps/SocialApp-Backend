import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from './schemas/post.schema';
import mongoose from 'mongoose';
import { PaginateDto } from './dto/paginate.dto';
import { MongoIdDto } from 'src/globalDtos/mongo-id.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name)
    private postModel: mongoose.Model<Post>,
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
  }

  async findByUser(userId, paginateDto: PaginateDto) {
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
  }

  async findById(mongoIdDto: MongoIdDto) {
    const { postId } = mongoIdDto;
    const post = await this.postModel
      .findById(postId)
      .populate('user', ['name', 'image']);

    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async delete(userId, mongoIdDto: MongoIdDto) {
    const post = await this.findById(mongoIdDto);

    if (post.user._id.toString() !== userId.toString()) {
      throw new UnauthorizedException(
        'You are not authorized to delete this post !!',
      );
    }

    const { postId } = mongoIdDto;
    await this.postModel.deleteOne({
      _id: new mongoose.Types.ObjectId(postId),
    });

    return {
      message: 'Post deleted successfully',
      deletedPost: post,
    };
  }
}
