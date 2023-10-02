import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find({});
    return users;
  }

  async create(user: CreateUserDto): Promise<object> {
    try {
      const { name, email, country, gender, password, confirmPassword } = user;

      const existingUser = await this.userModel.findOne({ email });

      if (password !== confirmPassword) {
        throw new BadRequestException('Password not match');
      }

      if (existingUser) {
        throw new BadRequestException(`User already exist`);
      }

      const newUser = await this.userModel.create({
        name,
        email,
        country,
        password,
        gender,
      });
      return { message: 'User Registered successfully', newUser };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      } else {
        console.log('Error while register user : ', error);
        throw new InternalServerErrorException(
          'Something unexpected occurred while register user',
        );
      }
    }
  }

  async findById(id: string | mongoose.Types.ObjectId): Promise<User> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new NotFoundException(`User with id ${id} not found !!`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while finding user : ', error);
        throw new InternalServerErrorException(
          'Something unexpected occurred while finding user',
        );
      }
    }
  }

  async findByEmail(email: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ email: email });
      if (!user) {
        throw new NotFoundException(`User not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      } else {
        console.log('Error while finding email', error);
        throw new InternalServerErrorException(
          'Something unexpected occurred while find my email',
        );
      }
    }
  }
}
