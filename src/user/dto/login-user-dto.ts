import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(6, 24)
  password: string;
}
