import { Controller, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('likes')
export class LikesController {
  constructor(private likesService: LikesService) {}
}
