import { Model } from 'mongoose';
import { UserDocument } from './schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
export declare class AuthService {
    private userModel;
    private transporter;
    constructor(userModel: Model<UserDocument>);
    findUserByEmail(email: string): Promise<UserDocument | null>;
    register(registerDto: RegisterDto): Promise<{
        email: string;
        verificationToken: string;
    }>;
    sendVerificationEmail(email: string, token: string): Promise<void>;
    verify(token: string): Promise<"Account already verified" | "Account verified successfully!">;
    login(email: string, password: string, res: Response): Promise<{
        message: string;
    }>;
    logout(res: Response): Promise<{
        message: string;
    }>;
}
