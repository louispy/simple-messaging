import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (!user) {
      throw new UnauthorizedException('User not registered');
    } else if (!user.isPasswordValid) {
      throw new UnauthorizedException('Usename or password invalid');
    }
    if (err) {
      throw err;
    }
    return user;
  }
}
