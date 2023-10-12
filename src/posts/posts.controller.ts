import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dtos/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { MongoIdDto } from 'src/common/dtos/mongo-id.dto';

@UseGuards(AuthGuard)
@Controller('posts')
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post('/create')
  createPost(
    @Body() createPostDto: CreatePostDto,
    @Request() req,
  ): Promise<object> {
    return this.postsService.create(createPostDto, req.user._id);
  }

  @Get('/')
  getAllPosts(@Query() paginationDto: PaginationDto): Promise<object> {
    return this.postsService.findAll(paginationDto);
  }

  @Get('/me')
  getMyPosts(
    @Request() req,
    @Query() paginationDto: PaginationDto,
  ): Promise<object> {
    return this.postsService.findByUser(req.user._id, paginationDto);
  }

  @Get('/user/:userId')
  getPostsByUser(
    @Param() mongoIdDto: MongoIdDto,
    @Query() paginationDto: PaginationDto,
  ): Promise<object> {
    const { userId } = mongoIdDto;
    return this.postsService.findByUser(userId, paginationDto);
  }

  @Get('/:postId')
  getPostById(@Param() mongoIdDto: MongoIdDto): Promise<object> {
    const { postId } = mongoIdDto;
    return this.postsService.findById(postId);
  }

  @Delete('/:postId')
  deleteMyPost(
    @Param() mongoIdDto: MongoIdDto,
    @Request() req,
  ): Promise<object> {
    const { postId } = mongoIdDto;
    return this.postsService.delete(req.user._id, postId);
  }
}
