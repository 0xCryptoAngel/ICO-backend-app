import { HttpException, HttpStatus } from '@nestjs/common';
import { Model } from 'mongoose';
// import { MongooseError } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../dto/user.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './authentication.interface';
import * as QRCode from 'qrcode';
import { authenticator } from 'otplib';
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,

    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async findAll() {
    return await this.userModel.find().exec();
  }

  async getById(_id: number) {
    const user = await this.userModel.findOne({ _id });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this id does not exist',
      HttpStatus.NOT_FOUND,
    );
  }

  async getByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (user) {
      return user;
    }
    throw new HttpException(
      'User with this email does not exist',
      HttpStatus.NOT_FOUND,
    );
  }
  public async register(registrationData: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(registrationData.password, 10);
    console.log('hashedPassword', hashedPassword);

    const secret = authenticator.generateSecret();
    //generate qr and put it in session
    const url = await QRCode.toDataURL(
      authenticator.keyuri(registrationData.email, 'Staking App Admin', secret),
    );

    try {
      const createdObj = await new this.userModel({
        ...registrationData,
        secret,
        password: hashedPassword,
      }).save();

      return { ...createdObj.toObject(), url };
    } catch (exception) {
      if (exception.code === 11000) {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public getCookieWithJwtToken(email: string) {
    const payload: TokenPayload = { email };
    const token = this.jwtService.sign(payload);
    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get(
      'JWT_EXPIRATION_TIME',
    )}`;
  }

  public getCookieForLogOut() {
    return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
  }

  public async getAuthenticatedUser(email: string, plainTextPassword: string) {
    try {
      const user = await this.userModel.findOne({ email });
      await this.verifyPassword(plainTextPassword, user.password);
      user.password = undefined;
      return user;
    } catch (error) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordMatching = await bcrypt.compare(
      plainTextPassword,
      hashedPassword,
    );
    if (!isPasswordMatching) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
