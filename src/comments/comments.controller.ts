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
import { MongoIdDto } from 'src/common/dtos/mongo-id.dto';
import { CreateCommentDto } from './dtos/create-comment.dto';
import { CommentsService } from './comments.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { DeleteCommentDto } from './dtos/delete-comment-dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthGuard)
@Controller('comments')
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post('post/:postId')
  addCommentToPost(
    @Request() req,
    @Param() mongoIdDto: MongoIdDto,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<object> {
    const { postId } = mongoIdDto;
    return this.commentsService.createPostComment(
      req.user._id,
      postId,
      createCommentDto,
    );
  }

  @Get('post/:postId')
  getPostComments(
    @Param() mongoIdDto: MongoIdDto,
    @Query() paginationDto: PaginationDto,
  ) {
    const { postId } = mongoIdDto;
    return this.commentsService.findByPost(postId, paginationDto);
  }

  @Get('/:commentId/replies')
  getCommentReplies(@Param() mongoIdDto: MongoIdDto) {
    const { commentId } = mongoIdDto;
    return this.commentsService.findCommentReplies(commentId);
  }

  @Delete('/:commentId/delete')
  DeleteComment(@Request() req, @Param() deleteCommentDto: DeleteCommentDto) {
    return this.commentsService.deletePostComment(
      req.user._id,
      deleteCommentDto,
    );
  }

  @Post('/:commentId/reply')
  ReplyToComment(
    @Request() req,
    @Param() mongoIdDto: MongoIdDto,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const { commentId } = mongoIdDto;
    return this.commentsService.createCommentReply(
      req.user._id,
      commentId,
      createCommentDto,
    );
  }
}
