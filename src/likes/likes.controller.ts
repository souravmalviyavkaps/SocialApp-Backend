import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { LikePostDto } from './dtos/like-post.dto';
import { LikeCommentDto } from './dtos/like-comment.dto';

@UseGuards(AuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}

  @Post('post/:postId')
  likePost(@Request() req, @Param() likePostDto: LikePostDto) {
    return this.likesService.likePost(req.user._id, likePostDto);
  }

  @Post('comment/:commentId')
  likeComment(@Request() req, @Param() likeCommentDto: LikeCommentDto) {
    return this.likesService.likeComment(req.user._id, likeCommentDto);
  }
}
