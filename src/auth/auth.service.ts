import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { SignUpSchema } from 'src/auth/dto/signup-user.dto';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInSchema } from './dto/signin.dto';
import { MailDataRequired, MailService } from '@sendgrid/mail';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private db: DatabaseService,
  ) {}
  async getOTP(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new Error('User not found');
    const otp = Math.floor(100000 + Math.random() * 900000);
    const userWithOTP = await this.userService.updateUser(user.id, {
      otpCode: otp,
    });
    console.log(userWithOTP.otpCode);
    const sendgrid = new MailService();
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY || '');
    const msg = {
      to: email, // Change to your recipient
      from: process.env.EMAIL_SERVICE_FROM, // Change to your verified sender
      subject: 'Order from the Cowboy Autopart Customer',
      cc: process.env.CC_EMAIL,
      text: `Your OTP is ${userWithOTP.otpCode} For Password change for Email : ${email}`,
    } as MailDataRequired;
    try {
      const response = await sendgrid.send(msg);
      console.log('Email sent', response);
    } catch (error) {
      console.log(error?.response?.body?.errors);
    }
    return { otpStatus: 'Send Succesfully' };
  }

  async passwordChange(email: string, password: string, otp: string) {
    const user = await this.db.user.findFirst({
      where: {
        email,
        otpCode: Number(otp),
      },
    });
    if (!user) throw new Error('User not found');
    const hash = await this.hashData(password);
    const updatedUser = await this.db.user.update({
      where: { id: user.id },
      data: { passwordHash: hash, otpCode: null },
    });
    return updatedUser;
  }

  // SignUp Service
  async signUp(body: SignUpSchema): Promise<unknown> {
    const { password, confirm_password, email } = body;

    // Check Password If They are Matched
    if (this.checkPassword(password, confirm_password))
      throw new HttpException(
        `${this.constructor.name}: Password do not matched`,
        HttpStatus.FORBIDDEN,
      );

    // Check if User Exist
    if (await this.isUserExist(email))
      throw new HttpException(
        `${this.constructor.name}: User Already Exists`,
        HttpStatus.CONFLICT,
      );

    const hash = await this.hashData(password);

    const payload = {
      role: process.env.DEFAULT_ROLE,
      email,
      passwordHash: hash,
      contactName: body.contact_name,
    } as Prisma.UserCreateInput;

    const user = await this.userService.createUser(payload);

    let formattedUser = this.formatResponse(user);
    const { accessToken, refreshToken } = await this.getTokens(user);

    const hashedToken = await this.hashData(refreshToken);

    const loggedInUser = await this.userService.updateUser(user.id, {
      refreshToken: hashedToken,
    });
    formattedUser = this.formatResponse(loggedInUser);

    return {
      user: formattedUser,
      tokens: { accessToken, refreshToken: refreshToken },
    };
  }

  // SignIn Service
  async signIn(body: SignInSchema): Promise<unknown> {
    const { email, password } = body;
    const user = await this.userService.findOneByEmail(email);

    // Validation Checks
    if (!user)
      throw new HttpException(
        `${this.constructor.name}: User Not Found`,
        HttpStatus.NOT_FOUND,
      );

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch)
      throw new HttpException(
        `${this.constructor.name}: Invalid Credentials`,
        HttpStatus.FORBIDDEN,
      );

    // Removing Unnecessary Data & Getting Tokens
    let formattedUser = this.formatResponse(user);
    const { accessToken, refreshToken } = await this.getTokens(user);

    // Updating Refresh Token
    const hashedToken = await this.hashData(refreshToken);
    const loggedInUser = await this.userService.updateUser(user.id, {
      refreshToken: hashedToken,
    });

    // Formatting Response
    formattedUser = this.formatResponse(loggedInUser);

    return {
      user: formattedUser,
      tokens: { accessToken, refreshToken: refreshToken },
    };
  }

  // Logout Service
  async logout(userId: string) {
    const user = await this.userService.findOneByID(userId);
    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);
    await this.userService.updateUser(userId, { refreshToken: null });
    return true;
  }

  // Refresh Token Service
  async updateRefreshToken(userId: string, refreshToken: string) {
    const user = await this.userService.findOneByID(userId);

    const isValid = await bcrypt.compare(
      refreshToken,
      user?.refreshToken as string,
    );

    if (!isValid) {
      await this.userService.updateUser(userId, { refreshToken: null });
      throw new HttpException(
        `${this.constructor.name}: Invalid Refresh Token`,
        HttpStatus.FORBIDDEN,
      );
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.getTokens(user);

    const hashed = await this.hashData(newRefreshToken);
    const newUser = await this.userService.updateUser(userId, {
      refreshToken: hashed,
    });
    const formattedUser = this.formatResponse(newUser);
    return {
      user: formattedUser,
      tokens: { accessToken, refreshToken: newRefreshToken },
    };
  }

  // Helper Functions
  checkPassword(password: string, confirm_password: string) {
    if (password.toLowerCase().trim() !== confirm_password.toLowerCase().trim())
      return true;
    return false;
  }

  async isUserExist(email: string) {
    const user = await this.userService.findOneByEmail(email);
    if (user) return true;
    return false;
  }

  async hashData(password: string) {
    const saltOrRounds = 10;
    return await bcrypt.hash(password, saltOrRounds);
  }

  formatResponse(data: Partial<User>) {
    delete data['passwordHash'];
    if (data['refreshToken']) delete data['refreshToken'];
    return data;
  }

  async addToken(payload: any) {
    payload['accessToken'] = await this.jwtService.signAsync(payload);
    const response = this.formatResponse(payload);
    return response;
  }

  async getTokens(payload: any) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '7h',
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);
    return { accessToken, refreshToken };
  }
}
