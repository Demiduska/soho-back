import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import RequestWithUser from './requestWithUser.interface';

@Injectable()
export default class JwtAuthGuard extends AuthGuard('jwt') {
  // canActivate(context: ExecutionContext) {
  //   return super.canActivate(context);
  // }
  //
  // handleRequest(err, user, info, context: ExecutionContext) {
  //   const request = context.switchToHttp().getRequest<RequestWithUser>();
  //   const params = request.params;
  //   if (user.id !== +params.id) {
  //     throw new ForbiddenException();
  //   }
  //
  //   return user;
  // }
}
