import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { User, UserDocument } from 'src/auth/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from 'src/auth/dtos/login-user.dto';
import { PatchAgeDto } from 'src/auth/dtos/patch-age.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(user: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createUser = new this.userModel({
      ...user,
      password: hashedPassword,
    });
    return createUser.save();
  }

  async login(user: LoginUserDto) {
    const existingUser = await this.userModel
      .findOne({ email: user.email })
      .exec();
    if (!existingUser) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      user.password,
      existingUser.password,
    );
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: existingUser._id, email: existingUser.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async patchAge(userId: number, patchAgeDto: PatchAgeDto): Promise<User> {
    const user = await this.userModel.findById(userId);

    if (!user) throw new NotFoundException();

    user.age = patchAgeDto.age;

    return user.save();
  }
}
