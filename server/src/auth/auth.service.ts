import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private transporter;

  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT),
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existingUser = await this.findUserByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
    });
    await newUser.save();

    await this.sendVerificationEmail(email, verificationToken);

    return { email, verificationToken };
  }

  async sendVerificationEmail(email: string, token: string) {
    const verifyUrl = `http://localhost:8080/verify?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: '"Auth Project" <noreply@authproject.com>',
        to: email,
        subject: 'Verify Your Account - Auth Project',
        text: `Please verify your account by clicking this link: ${verifyUrl}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h2 style="color: #333;">Welcome to Auth Project!</h2>
            <p style="color: #555; font-size: 16px;">Thank you for registering. Please verify your email by clicking the button below.</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; margin: 20px 0;">Verify Your Account</a>
            <p style="color: #555; font-size: 14px;">If the button doesn't work, use this link: <a href="${verifyUrl}" style="color: #4CAF50;">${verifyUrl}</a></p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">If you didn’t sign up, ignore this email.</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async verify(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { email: string };
      const user = await this.findUserByEmail(decoded.email);
      if (!user) {
        throw new Error('User not found');
      }
      if (user.isVerified) {
        return 'Account already verified';
      }
      user.isVerified = true;
      await user.save();
      return 'Account verified successfully!';
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  async login(email: string, password: string, res: Response) {
    const user = await this.findUserByEmail(email);
    if (!user || !user.isVerified) {
      throw new Error('Invalid credentials or unverified email');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '1h' });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Увімкнути лише для HTTPS
      maxAge: 3600000, // 1 година
      sameSite: 'lax', // Додавати для кращої роботи з CORS
    });

    return { message: 'Login successful!' };
  }

  async logout(res: Response) {
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // Видаляємо куку
    });
    return { message: 'Logout successful!' };
  }
}