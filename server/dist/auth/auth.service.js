"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
let AuthService = class AuthService {
    constructor(userModel) {
        this.userModel = userModel;
        this.transporter = nodemailer.createTransport({
            host: process.env.MAILTRAP_HOST,
            port: Number(process.env.MAILTRAP_PORT),
            auth: {
                user: process.env.MAILTRAP_USER,
                pass: process.env.MAILTRAP_PASS,
            },
        });
    }
    async findUserByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async register(registerDto) {
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
    async sendVerificationEmail(email, token) {
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
        }
        catch (error) {
            console.error('Error sending email:', error);
            throw new Error('Failed to send verification email');
        }
    }
    async verify(token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
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
        }
        catch (error) {
            throw new Error('Invalid or expired token');
        }
    }
    async login(email, password, res) {
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
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000,
            sameSite: 'lax',
        });
        return { message: 'Login successful!' };
    }
    async logout(res) {
        res.cookie('jwt', '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 0,
        });
        return { message: 'Logout successful!' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AuthService);
//# sourceMappingURL=auth.service.js.map