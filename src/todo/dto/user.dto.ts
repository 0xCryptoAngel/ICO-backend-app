export class BaseUserDto {
  _id?: string;
  email: string;
  name: string;
  password: string;
  role: number;
  updated_at: Date;
  created_at: Date;
}

export class CreateUserDto extends BaseUserDto {}

export class UpdateUserDto extends BaseUserDto {}
