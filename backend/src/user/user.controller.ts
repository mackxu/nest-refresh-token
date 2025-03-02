import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserLoginDto } from './dto/user-login.dto';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Inject(JwtService)
  private readonly jwtService: JwtService;

  @Post('login')
  async login(@Body() loginUser: UserLoginDto) {
    const user = await this.userService.login(loginUser);
    return this.setToken(user);
  }

  @Get('refresh_token')
  async refresh(@Query('token') token: string) {
    try {
      const data = this.jwtService.verify(token);
      const user = await this.userService.findUserById(data.userId);
      return this.setToken(user);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('token 无效, 请重新登录');
    }
  }
  setToken(user: User) {
    const accessToken = this.jwtService.sign(
      {
        username: user.username,
        userId: user.id,
      },
      {
        expiresIn: '15s',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        userId: user.id,
      },
      {
        expiresIn: '5m',
      },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
