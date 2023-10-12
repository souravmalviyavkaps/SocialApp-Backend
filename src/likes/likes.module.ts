import { Module } from '@nestjs/common';
import { LikesController } from './likes.controller';
import { LikesService } from './likes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './schemas/like.schema';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { PostsModule } from 'src/posts/posts.module';
import { CommentsModule } from 'src/comments/comments.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    JwtModule,
    UserModule,
    PostsModule,
    CommentsModule,
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
