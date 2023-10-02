import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import mongoose from 'mongoose';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 200)
  content: string;
}
