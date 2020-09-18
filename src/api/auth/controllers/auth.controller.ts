import { controller, httpPost, request, requestBody, response, requestParam, httpGet, principal } from 'inversify-express-utils';
import { Request, Response } from 'express';
import { ApiPath, ApiOperationPost, ApiOperationGet } from 'swagger-express-typescript';

import { ControllerBase } from '../../base/controller.base';
import { AuthService } from '../services/auth.service';
import { UserWithToken } from '../models/user-with-token.model';
import { SignInCredentials } from '../interfaces/sign-in-credentials.interface';
import { SignUpCredentials } from '../interfaces/sign-up-credentials.interface';
import { Principal } from '../models/principal.model';
import { AuthMiddleware } from '../middlewares/auth.middleware';


@ApiPath({
    path: '/api/v1/auth',
    name: 'Auth',
    security: {
        apiKeyHeader: []
    },
})
@controller('/auth')
export class AuthController extends ControllerBase {
    constructor(
        private _authService: AuthService
    ) {
        super();
    }

    @ApiOperationPost({
        summary: 'Sign Up',
        path: '/sign-up',
        parameters: {
            body: {
                required: true,
                allowEmptyValue: false,
                description: 'Valid passwords are at least 6 characters long, contain numbers, uppercase and lowercase letters',
                properties: {
                    firstName: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User firstname',
                        example: 'Json'
                    },
                    lastName: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User lastname',
                        example: 'Bourne'
                    },
                    username: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User nickname',
                        example: 'elonmusk'
                    },
                    email: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User email',
                        example: 'example@gmail.com'
                    },
                    password: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User password',
                        example: 'catsAreCute!2020'
                    }
                }
            }
        },
        responses: {
            200: {
                description: 'Sends verification link to specified email',
            },
            409: {
                model: 'HttpError',
                description: 'This email already exists | This username already exists'
            },
            422: {
                model: 'HttpError',
                description: 'Wrong json | Wrong email format | Password must be at least 6 characters long, contain numbers, uppercase and lowercase letters'
            }
        },
        security: {
            apiKeyHeader: [],
        }
    })
    @httpPost('/sign-up')
    public async signUp(
        @requestBody() credentials: SignUpCredentials,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            await this._authService.signUp(credentials);
            return this._success(res, 200);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationPost({
        summary: 'Sign In',
        path: '/sign-in',
        parameters: {
            body: {
                required: true,
                allowEmptyValue: false,
                description: 'Accepts emails or usernames',
                properties: {
                    emailOrUsername: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User email or username',
                        example: 'elonmusk || example@gmail.com'
                    },
                    password: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                        description: 'User password',
                        example: 'catsAreCute!2020'
                    }
                }
            }
        },
        responses: {
            200: {
                model: 'UserWithToken',
                description: 'Returns user with jwt token'
            },
            417: {
                model: 'HttpError',
                description: 'User doesn\'t exist or password doesn\'t match'
            },
            422: {
                model: 'HttpError',
                description: 'Wrong json'
            },
        }
    })
    @httpPost('/sign-in')
    public async signIn(
        @requestBody() credentials: SignInCredentials,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const userWithToken: UserWithToken = await this._authService.signIn(credentials);
            return this._success<UserWithToken> (res, 200, userWithToken);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationGet({
        summary: 'Email verification',
        path: '/confirm-email/{token}',
        parameters: {
            path: {
                token: {
                    name: 'token',
                    description: 'Email confirmation token',
                    required: true
                }
            },
        },
        responses: {
            200: {
                model: 'UserWithToken',
                description: 'Returns user with jwt token'
            },
            417: {
                model: 'HttpError',
                description: 'Token is broken or expired'
            }
        }
    })
    @httpGet('/confirm-email/:token')
    public async confirmEmail(
        @requestParam('token') token: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const userWithToken: UserWithToken = await this._authService.confirmEmail(token);
            return this._success<UserWithToken> (res, 200, userWithToken);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationGet({
        summary: 'Resend verification link',
        path: '/resend-confirm-email',
        description: 'In case if original link expires (5m lifetime)',
        responses: {
            200: {
                description: 'Sends new verification link to user\'s email'
            },
            404: {
                model: 'HttpError',
                description: 'User not found'
            },
            409: {
                model: 'HttpError',
                description: 'User already activated'
            }
        }
    })
    @httpGet('/resend-confirm-email', AuthMiddleware)
    public async resendConfirmEmail(
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            await this._authService.resendConfirmEmail(principal);
            return this._success(res, 200);
        } catch (error) {
            return this._fail(res, error);
        }
    }
}
