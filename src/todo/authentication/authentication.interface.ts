import { Request } from 'express';
import { User } from '../schemas/user.schema';

export interface TokenPayload {
  email: string;
}

export interface RequestWithUser extends Request {
  user: User;
}
