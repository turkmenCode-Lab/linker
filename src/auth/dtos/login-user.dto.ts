import { IsEmail, IsNotEmpty, Matches, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @Matches(/[a-zA-Z]/, { message: 'Password must contain at least one letter' })
  password: string;
}
