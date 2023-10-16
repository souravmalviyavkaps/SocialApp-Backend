import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('users')
export class UserController {
  constructor(private userSerice: UserService) {}

  @Get('/')
  async getAllUsers(): Promise<User[]> {
    return this.userSerice.findAll();
  }

  @Post('new')
  async createUser(@Body() user: CreateUserDto): Promise<object> {
    return this.userSerice.create(user);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req): User {
    return req.user;
  }

  @Get('/:id')
  async findUserById(@Param('id') id: string): Promise<User> {
    return this.userSerice.findById(id);
  }
}
