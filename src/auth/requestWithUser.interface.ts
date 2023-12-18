import { Request } from 'express';
import { UserEntityPg } from '../users/entities/pg/user.entity';

interface RequestWithUser extends Request {
  user: UserEntityPg;
}

export default RequestWithUser;
