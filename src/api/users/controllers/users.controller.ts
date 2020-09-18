import { Request, Response } from 'express';
import {
    controller, httpDelete, httpGet, httpPut, principal, queryParam, request, requestBody, requestParam, response,
} from 'inversify-express-utils';
import { OK } from 'http-status-codes';
import {
    ApiOperationDelete, ApiOperationGet, ApiOperationPut, ApiPath, SwaggerDefinitionConstant,
} from 'swagger-express-typescript';
import { Types } from 'mongoose';

import { ControllerBase } from '../../base/controller.base';
import { Principal } from '../../auth/models/principal.model';
import { UsersService } from '../services/users.service';
import { DocumentUser, User } from '../models/user.model';
import { AuthMiddleware } from '../../auth/middlewares/auth.middleware';
import { ActivatedUserMiddleware } from '../../auth/middlewares/activated.user.middleware';


@ApiPath({
    path: '/api/v1/users',
    name: 'Users',
    security: { apiKeyHeader: [] },
})
@controller('/users')
export class UsersController extends ControllerBase {
    constructor(
        private _userService: UsersService
    ) {
        super();
    }

    @ApiOperationGet({
        description: 'Search for user object or list of users objects by search query',
        summary: 'Users search',
        path: '/',
        parameters: {
            query: {
                search: {
                    type: SwaggerDefinitionConstant.Response.Type.STRING,
                    required: false,
                    allowEmptyValue: true,
                    name: 'search',
                    description: 'Searching by username / email / firstname / lastname',
                },
                skip: {
                    type: SwaggerDefinitionConstant.Response.Type.NUMBER,
                    required: false,
                    allowEmptyValue: true,
                    name: 'skip',
                    description: 'Skip count',
                },
                limit: {
                    type: SwaggerDefinitionConstant.Response.Type.NUMBER,
                    required: false,
                    allowEmptyValue: true,
                    name: 'limit',
                    description: 'Limit count',
                },
            }
        },
        responses: {
            200: {
                description: 'users array DTO',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'User',
            }
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/')
    public async findUsers(
        @queryParam('search') search: string,
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const users: DocumentUser[] = await this._userService.findUsersBySearchOrAll(
                search,
                Number.parseInt(skip),
                Number.parseInt(limit),
                principal
            );
            return this._success<{ users: DocumentUser[] }>(res, OK, { users });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        path: '/current',
        description: 'Get current logged user',
        summary: 'Get current user',
        parameters: {},
        responses: {
            200: {
                description: 'Returns DTO with current user',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'User',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/current', AuthMiddleware)
    public async findCurrentUser(
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const user: DocumentUser = await this._userService.findCurrentUser(principal);
            return this._success<{ user: DocumentUser }>(res, OK, { user });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationPut({
        description: 'Update currently logged user',
        summary: 'Update current user',
        path: '/current',
        parameters: {
            body: {
                required: true,
                allowEmptyValue: false,
                model: 'User'
            }
        },
        responses: {
            200: {
                description: 'Returns updated user',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'User',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            403: {
                description: 'Account not activated',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            409: {
                description: 'This username already exists | This email already exists',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            422: {
                description: 'Wrong email format',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },


        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/current', AuthMiddleware, ActivatedUserMiddleware)
    public async updateCurrentUser(
        @requestBody() user: User,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const updatedUser: DocumentUser = await this._userService.updateUser(user, principal);
            return this._success<{ updatedUser: DocumentUser }>(res, OK, { updatedUser });
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationDelete({
        description: 'Delete current logged user',
        summary: 'delete current user',
        path: '/current',
        parameters: {},
        responses: {
            200: {
                description: '{ "status": "ok" }',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            }
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpDelete('/current', AuthMiddleware)
    public async deleteCurrentUser(
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            await this._userService.deleteUserById(principal);
            return this._success<{ user: DocumentUser }>(res, OK);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationGet({
        description: 'Returns array of users that are following given user id',
        summary: 'Get array of followers',
        path: '/followers/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of followed user',
                    required: true
                }
            },
            query: {
                skip: {
                    type: 'number',
                    required: false,
                    allowEmptyValue: true,
                    name: 'skip',
                    description: 'Skip count',
                },
                limit: {
                    type: 'number',
                    required: false,
                    allowEmptyValue: true,
                    name: 'limit',
                    description: 'Limit count',
                },
            }
        },
        responses: {
            200: {
                description: '{ "followers": [user objects] }',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'User',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/followers/:id')
    public async findFollowers(
        @principal() principal: Principal,
        @requestParam('id') id: string,
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const followers: DocumentUser[] = await this._userService.findFollowers(
                new Types.ObjectId(id),
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ followers: DocumentUser[] }>(res, OK, { followers });
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationGet({
        description: 'Returns array of users that are followed by given user Id',
        summary: 'Get array of follows',
        path: '/follows/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of following user',
                    required: true
                }
            },
            query: {
                skip: {
                    type: 'number',
                    required: false,
                    allowEmptyValue: true,
                    name: 'skip',
                    description: 'Skip count',
                },
                limit: {
                    type: 'number',
                    required: false,
                    allowEmptyValue: true,
                    name: 'limit',
                    description: 'Limit count',
                },
            }
        },
        responses: {
            200: {
                description: '{ "follows": [user objects] }',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'User',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/follows/:id')
    public async findFollows(
        @principal() principal: Principal,
        @requestParam('id') id: string,
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const follows: DocumentUser[] = await this._userService.findFollows(
                new Types.ObjectId(id),
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ follows: DocumentUser[] }>(res, OK, { follows });
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationPut({
        description: 'Follow user object',
        summary: 'Follow user',
        path: '/follow/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of user to follow',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: 'Ok',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            403: {
                description: 'Account not activated',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/follows/:id', AuthMiddleware, ActivatedUserMiddleware)
    public async followUser(
        @requestParam('id') id: string,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            await this._userService.followUser(new Types.ObjectId(id), principal);
            return this._success<{ user: DocumentUser }>(res, OK);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationPut({
        description: 'Unfollow user object',
        summary: 'Unfollow user',
        path: '/unfollow/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of user to unfollow',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: 'Ok',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            403: {
                description: 'Account not activated',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/unfollow/:id', AuthMiddleware, ActivatedUserMiddleware)
    public async unfollowUser(
        @requestParam('id') id: string,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            await this._userService.unfollowUser(new Types.ObjectId(id), principal);
            return this._success<{ user: DocumentUser }>(res, OK);
        } catch (error) {
            return this._fail(res, error);
        }
    }

    @ApiOperationGet({
        path: '/{id}',
        description: 'Get one user by id',
        summary: 'Get one user',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of user to get',
                    required: true
                }
            },
        },
        responses: {
            200: {
                description: 'Returns user DTO',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'User',
            },
            404: {
                description: 'User not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/:id')
    public async findUserById(
        @requestParam('id') id: string,
        @request() req: Request,
        @response() res: Response,
        @principal() principal: Principal,
    ): Promise<Response> {
        try {
            const user: DocumentUser = await this._userService.findUserById(new Types.ObjectId(id), principal);
            return this._success<{ user: DocumentUser }>(res, OK, { user });
        } catch (error) {
            return this._fail(res, error);
        }
    }
}
