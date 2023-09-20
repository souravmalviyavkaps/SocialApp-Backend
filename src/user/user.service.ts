import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
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
    const { name, email, country, gender, password, confirmPassword } = user;

    const existingUser = await this.userModel.findOne({ email });

    if (password !== confirmPassword) {
      throw new BadRequestException('Password not match');
    }

    if (existingUser) {
      throw new BadRequestException(`User already exist`);
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await this.userModel.create({
      name,
      email,
      country,
      password: hashPassword,
      gender,
    });
    return { message: 'User Registered successfully', newUser };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found !!`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email: email });
    return user;
  }
}
