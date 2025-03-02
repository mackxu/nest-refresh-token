import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserLoginDto } from './dto/user-login.dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  @InjectEntityManager()
  private readonly entityManager: EntityManager;

  async login(userLoginDto: UserLoginDto) {
    const { username, password } = userLoginDto;
    const user = await this.entityManager.findOne(User, {
      where: { username },
    });
    if (!user) {
      throw new HttpException('用户不存在', HttpStatus.OK);
    }

    if (user.password !== password) {
      throw new HttpException('密码错误', HttpStatus.OK);
    }
    return user;
  }

  findUserById(id: number) {
    return this.entityManager.findOne(User, {
      where: { id },
    });
  }
}
