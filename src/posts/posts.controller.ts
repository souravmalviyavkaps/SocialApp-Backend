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
import { PaginateDto } from './dtos/paginate.dto';
import { MongoIdDto } from 'src/shared/dtos/mongo-id.dto';
import { PostCommentDto } from '../shared/dtos/add-post-comment.dto';

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
  getAllPosts(@Query() paginateDto: PaginateDto): Promise<object> {
    console.log('paginateDto', paginateDto);
    return this.postsService.findAll(paginateDto);
  }

  @Get('/me')
  getMyPosts(
    @Request() req,
    @Query() paginateDto: PaginateDto,
  ): Promise<object> {
    return this.postsService.findByUser(req.user._id, paginateDto);
  }

  @Get('/user/:userId')
  getPostsByUser(
    @Param() mongoIdDto: MongoIdDto,
    @Query() paginateDto: PaginateDto,
  ): Promise<object> {
    const { userId } = mongoIdDto;
    return this.postsService.findByUser(userId, paginateDto);
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

  //Likes on post
  @Post('/:postId/like')
  likePost(@Param() mongoIdDto: MongoIdDto, @Request() req) {
    const { postId } = mongoIdDto;
    return this.postsService.likePost(req.user._id, postId);
  }

  @Post('/:postId/comment')
  addPostComment(
    @Body() postCommentDto: PostCommentDto,
    @Request() req,
    @Param() mongoIdDto: MongoIdDto,
  ) {
    const { postId } = mongoIdDto;
    return this.postsService.addComment(req.user._id, postId, postCommentDto);
  }

  @Delete('/delete-comment/:commentId')
  deleteComment(@Param() mongoIdDto: MongoIdDto, @Request() req) {
    const { commentId } = mongoIdDto;
    return this.postsService.deleteComment(req.user._id, commentId);
  }
}
