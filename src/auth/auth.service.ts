import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginUserDto } from 'src/user/dto/login-user-dto';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(loginUserDto: LoginUserDto): Promise<any> {
    const { email, password } = loginUserDto;
    const user = await this.userService.findByEmail(email);

    console.log('user : ', user);
    if (!user) {
      throw new UnauthorizedException(`User does not exist`);
    }
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      throw new UnauthorizedException(`Password does not match`);
    }

    const payload = { userId: user._id, username: user.email };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
