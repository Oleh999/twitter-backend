import { injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { compare, hash } from 'bcrypt';
import { CONFLICT, EXPECTATION_FAILED, INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY } from 'http-status-codes';

import { DocumentUser, User } from '../../users/models/user.model';
import { UsersService } from '../../users/services/users.service';
import { MailService } from './mail.service';
import { HttpError } from '../../../shared/models/http.error';
import { UserWithToken } from '../models/user-with-token.model';
import { TokenService } from './token.service';
import { DocumentToken } from '../models/token.model';
import { TokenType } from '../enums/token.enum';
import { SignInCredentials } from '../interfaces/sign-in-credentials.interface';
import { SignUpCredentials } from '../interfaces/sign-up-credentials.interface';
import { Principal } from '../models/principal.model';


@injectable()
export class AuthService {
    constructor(
        private _usersService: UsersService,
        private _tokenService: TokenService,
        private _mailService: MailService
    ) {}

    public async getUserFromToken(token: string): Promise<DocumentUser> {
        try {
            const decrypted: any = verify(
                token, process.env.JWT_SECRET
            );
            return await this._usersService.findById(decrypted.userId);
        } catch (error) {
            throw error;
        }
    }

    public async signUp(credentials: SignUpCredentials): Promise<void> {
        const emailRegExp: RegExp = new RegExp(
            /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/ // https://regex101.com/library/mX1xW0
        );
        if (emailRegExp.test(credentials.email) === false) {
            throw new HttpError(UNPROCESSABLE_ENTITY, 'Wrong email format');
        }

        const passwordRegExp: RegExp = new RegExp(
            /^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/ // https://regex101.com/library/fX8dY0
        );
        if (passwordRegExp.test(credentials.password) === false) {
            throw new HttpError(
                UNPROCESSABLE_ENTITY,
                'Password must be at least 6 characters long, contain numbers, uppercase and lowercase letters'
            );
        }

        if (
            Object.keys(credentials).length !== 5 ||
            !credentials.firstName ||
            !credentials.lastName ||
            !credentials.username
        )
        {
            throw new HttpError(UNPROCESSABLE_ENTITY, 'Wrong json');
        }

        let existingUser: DocumentUser = await this._usersService.findByUsername(
            credentials.username
        );
        if (existingUser) {
            throw new HttpError(CONFLICT, 'This username already exists');
        }

        existingUser = await this._usersService.findByEmail(
            credentials.email
        );
        if (existingUser) {
            throw new HttpError(CONFLICT, 'This email already exists');
        }

        try {
            const newUser: User = new User({
                firstName: credentials.firstName,
                lastName: credentials.lastName,
                username: credentials.username,
                email: credentials.email,
                password: await hash(credentials.password, 10)
            });
            const documentUser: DocumentUser = await this._usersService.createUser(newUser),
                confirmEmailToken: DocumentToken = await this._tokenService.createConfirmPasswordToken(documentUser._id);
            await this._mailService.sendConfirmMail(
                credentials.email, confirmEmailToken.tokenBody
            );
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async confirmEmail(token: string): Promise<UserWithToken> {
        const documentToken: DocumentToken = await this._tokenService.findTokenByBodyAndType(token, TokenType.ConfirmEmail);
        if (!documentToken || documentToken.isExpired) {
            throw new HttpError(EXPECTATION_FAILED, 'Token is broken or expired');
        }

        try {
            const userId: any = documentToken.userId,
                documentUser: DocumentUser = await this._usersService.activateUser(userId);
            const jwtToken = sign({
                    userId: documentUser._id
                },
                process.env.JWT_SECRET, {
                    expiresIn: '3h'
                }
            );
            await this._tokenService.deleteToken(documentToken._id);
            return new UserWithToken(documentUser, jwtToken);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async signIn(credentials: SignInCredentials): Promise<UserWithToken> {
        if (
            Object.keys(credentials).length !== 2 ||
            !credentials.emailOrUsername ||
            !credentials.password
        )
        {
            throw new HttpError(UNPROCESSABLE_ENTITY, 'Wrong json');
        }

        const documentUser: DocumentUser = await this._usersService.findUserByEmailOrUsername(credentials.emailOrUsername),
            passwordCompare: boolean = await compare(credentials.password, documentUser.password);
        if (!documentUser || !passwordCompare) {
            throw new HttpError(EXPECTATION_FAILED, 'User doesn\'t exist or password doesn\'t match');
        }

        try {
            const jwtToken = sign({
                    userId: documentUser._id
                },
                process.env.JWT_SECRET, {
                    expiresIn: '3h'
                }
            );
            delete documentUser.password;
            return new UserWithToken(documentUser, jwtToken);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async resendConfirmEmail(principal: Principal): Promise<void> {
        const { active } = await this._usersService.findById(principal.details._id);
        if (active) {
            throw new HttpError(CONFLICT, 'User already activated');
        }

        try {
            await this._tokenService.deleteTokenByUserId(principal.details._id);
            const confirmEmailToken: DocumentToken = await this._tokenService.createConfirmPasswordToken(principal.details._id);
            await this._mailService.sendConfirmMail(principal.details.email, confirmEmailToken.tokenBody);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }
}
