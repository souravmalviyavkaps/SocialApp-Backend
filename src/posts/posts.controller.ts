import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { PaginateDto } from './dto/paginate.dto';
import { MongoIdDto } from 'src/globalDtos/mongo-id.dto';

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
    return this.postsService.findById(mongoIdDto);
  }

  @Delete('/:postId')
  deleteMyPost(
    @Param() mongoIdDto: MongoIdDto,
    @Request() req,
  ): Promise<object> {
    return this.postsService.delete(req.user._id, mongoIdDto);
  }

  @Patch('/edit')
  editPost(@Param() mongoIdDto: MongoIdDto) {
    console.log(mongoIdDto);
  }
}
