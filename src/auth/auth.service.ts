import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare as comparePassword } from 'bcrypt';

import { User } from '../users/entities/users.schema';
import { UsersService } from '../users/users.service';
import { JwtAuthResponse } from './dto/auth.response';
import { JwtPayload } from './dto/jwt.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.userService.findOne(username);
    if (user) {
      const compareResult = await comparePassword(pass, user.password);
      if (compareResult) {
        const { password, ...result } = user;
        return { ...result, isPasswordValid: true };
      }
      return { isPasswordValid: false };
    }
    return null;
  }

  login(user: User): JwtAuthResponse {
    const payload: JwtPayload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
      company: user.company,  
    };
    return {
      accessToken: this.jwtService.sign(payload),
    } as JwtAuthResponse;
  }
}
