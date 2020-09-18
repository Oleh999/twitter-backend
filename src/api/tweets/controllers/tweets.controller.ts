import { Request, Response } from 'express';
import {
    controller, httpDelete, httpGet, httpPost, httpPut, principal, queryParam, request, requestBody, requestParam,
    response,
} from 'inversify-express-utils';
import {
    ApiOperationDelete, ApiOperationGet, ApiOperationPost, ApiOperationPut, ApiPath, SwaggerDefinitionConstant,
} from 'swagger-express-typescript';
import { Types } from 'mongoose';
import { BAD_REQUEST, OK } from 'http-status-codes';

import { ControllerBase } from '../../base/controller.base';
import { TweetsService } from '../services/tweets.service';
import { DocumentTweet, Tweet } from '../models/tweet.model';
import { Principal } from '../../auth/models/principal.model';
import { AuthMiddleware } from '../../auth/middlewares/auth.middleware';
import { HttpError } from '../../../shared/models/http.error';
import { DocumentUser } from '../../users/models/user.model';

@ApiPath({
    path: '/api/v1/tweets',
    name: 'Tweets',
    security: { apiKeyHeader: [] },
})
@controller('/tweets')
export class TweetsController extends ControllerBase {

    constructor(
        private _tweetsService: TweetsService
    ) {
        super();
    }

    @ApiOperationPost({
        description: 'Post tweet object',
        summary: 'Post new tweet',
        path: '/',
        parameters: {
            body: {
                description: 'Post tweet',
                required: false,
                allowEmptyValue: true,
                properties: {
                    text: {
                        type: 'string',
                        required: false,
                        allowEmptyValue: true,
                    }
                }
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPost('/', AuthMiddleware)
    public async createTweet(
        @requestBody() body: { text: string },
        @request() req: Request,
        @response() res: Response,
        @principal() principal: Principal,
    ): Promise<Response> {
        try {
            if (!body.text) {
                this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet text is missing')
                );
            }
            const newTweet: DocumentTweet = await this._tweetsService.createTweet(
                new Tweet({
                    text: body.text,
                    authorId: principal.details._id
                })
            );
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet: newTweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationDelete({
        description: 'Delete tweet object',
        summary: 'Delete tweet',
        path: '/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet to delete',
                    required: true
                }
            },
            body: {
                description: 'Delete tweet',
                required: false,
                model: 'Tweet',
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpDelete('/:id', AuthMiddleware)
    public async deleteTweet(
        @requestParam('id') id: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            const tweet = await this._tweetsService.deleteTweet(new Types.ObjectId(id));
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationPut({
        description: 'Update tweet object',
        summary: 'Update tweet',
        path: '/',
        parameters: {
            body: {
                description: 'Update tweet',
                required: false,
                allowEmptyValue: true,
                properties: {
                    _id: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false
                    },
                    text: {
                        type: 'string',
                        required: false,
                        allowEmptyValue: true,
                    }
                }
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/', AuthMiddleware)
    public async updateTweet(
        @requestBody() body: { text: string , _id: string },
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response,
    ): Promise<Response> {
        try {
            if (!body._id) {
                this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            if (!body.text) {
                this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet text is missing')
                );
            }
            const updatedTweet: DocumentTweet = await this._tweetsService.updateTweet(
                new Tweet({
                    _id: new Types.ObjectId(body._id),
                    text: body.text,
                    lastEdited: Date.now(),
                })
                , principal);
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet: updatedTweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        description: 'Find tweets object by Author id/' +
            'If there is a tweetRetweet in this object it means that it is a retweet',
        summary: 'Find tweets',
        path: '/author/{id}',
        parameters: {
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
            },
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of author to find tweets',
                    required: true
                }
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
            404: {
                description: 'Tweets not found',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/author/:id', AuthMiddleware)
    public async findTweetByAuthorId(
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @principal() principal: Principal,
        @requestParam('id') id: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Author id is missing')
                );
            }
            const tweet: DocumentTweet[] = await this._tweetsService.findTweetsByAuthorId(
                new Types.ObjectId(id),
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ tweet: DocumentTweet[] }>(res, OK, { tweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationPut({
        description: 'Like tweet object',
        summary: 'Like tweet',
        path: '/like/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet to like',
                    required: true
                }
            },
            body: {
                description: 'Like tweet',
                required: true,
                model: 'Tweet',
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/like/:id', AuthMiddleware)
    public async likeTweet(
        @principal() principal: Principal,
        @requestParam('id') id: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            const tweet: DocumentTweet = await this._tweetsService.likeTweet(
                principal.details._id,
                new Types.ObjectId(id)
            );
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationPut({
        description: 'Unlike tweet object',
        summary: 'Unlike tweet',
        path: '/unlike/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet to unlike',
                    required: true
                }
            },
            body: {
                description: 'Unlike tweet',
                required: true,
                model: 'Tweet',
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPut('/unlike/:id', AuthMiddleware)
    public async unlikeTweet(
        @principal() principal: Principal,
        @requestParam('id') id: string,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            const tweet: DocumentTweet = await this._tweetsService.unlikeTweet(
                principal.details._id,
                new Types.ObjectId(id)
            );
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        description: 'Find tweets object by following/' +
            'If there is a tweetRetweet in this object it means that it is a retweet',
        summary: 'Find feed',
        path: '/feed',
        parameters: {
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
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
            404: {
                description: 'Tweets not found',
                type: SwaggerDefinitionConstant.Response.Type.ARRAY,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/feed', AuthMiddleware)
    public async findTweetsByFollowing(
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            const tweets: DocumentTweet[] = await this._tweetsService.findTweetsByFollowing(
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ tweets: DocumentTweet[] }>(res, OK, { tweets });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        description: 'Find tweet by id',
        summary: 'Find tweet',
        path: '/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet to find',
                    required: true
                }
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/:id', AuthMiddleware)
    public async findTweetById(
        @requestParam('id') id: string,
        @principal() principal: Principal,
        @request() req: Request,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            const tweet: DocumentTweet = await this._tweetsService.findById(
                new Types.ObjectId(id),
                principal
            );
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationPost({
        description: 'Retweet tweet object',
        summary: 'Retweet tweet',
        path: '/retweet',
        parameters: {
            body: {
                description: 'Retweet tweet',
                required: true,
                properties: {
                    retweetedTweet: {
                        type: 'string',
                        required: true,
                        allowEmptyValue: false,
                    }
                }
            },
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
            404: {
                description: 'Tweet not found',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
            },
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpPost('/retweet', AuthMiddleware)
    public async createRetweet(
        @requestBody() body: { retweetedTweet: string },
        @request() req: Request,
        @response() res: Response,
        @principal() principal: Principal,
    ): Promise<Response> {
        try {
            if (!body.retweetedTweet) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'retweetedTweet id is missing')
                );
            }
            const retweet: DocumentTweet = await this._tweetsService.createTweet(
                new Tweet({
                    retweetedTweet: new Types.ObjectId(body.retweetedTweet),
                    authorId: principal.details._id,
                    lastEdited: Date.now()
                })
            );
            return this._success<{ tweet: DocumentTweet }>(res, OK, { tweet: retweet });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        description: 'Find retweets by tweet id',
        summary: 'Find retweets by tweet id',
        path: '/retweets/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet'
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError'
            },
            401: {
                description: 'Unauthorized',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError'
            }
        },
        security: {
            apiKeyHeader: [],
        },
    })
    @httpGet('/retweets/:id', AuthMiddleware)
    public async findRetweetsByTweetId(
        @requestParam('id') id: string,
        @principal() principal: Principal,
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'retweetedTweet id is missing')
                );
            }
            const retweets: DocumentTweet[] = await this._tweetsService.findRetweetsByTweetId(
                new Types.ObjectId(id),
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ tweets: DocumentTweet[] }>(res, OK, { tweets: retweets });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }

    @ApiOperationGet({
        description: 'Find users by tweet likes',
        summary: 'Find users by tweet likes',
        path: '/likes/{id}',
        parameters: {
            path: {
                id: {
                    type: 'string',
                    name: 'id',
                    allowEmptyValue: false,
                    description: 'Id of tweet',
                    required: true
                }
            }
        },
        responses: {
            200: {
                description: 'Success',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'Tweet',
            },
            400: {
                description: 'Parameters fail',
                type: SwaggerDefinitionConstant.Response.Type.OBJECT,
                model: 'HttpError',
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
    @httpGet('/likes/:id', AuthMiddleware)
    public async findLikersByTweetId(
        @requestParam('id') id: string,
        @principal() principal: Principal,
        @queryParam('skip') skip: string,
        @queryParam('limit') limit: string,
        @response() res: Response
    ): Promise<Response> {
        try {
            if (!id) {
                return this._fail(
                    res,
                    new HttpError(BAD_REQUEST, 'Tweet id is missing')
                );
            }
            const users: DocumentUser[] = await this._tweetsService.findLikersByTweetId(
                new Types.ObjectId(id),
                principal,
                Number.parseInt(skip),
                Number.parseInt(limit)
            );
            return this._success<{ users: DocumentUser[] }>(res, OK, { users });
        } catch (error) {
            return this._fail(
                res,
                error
            );
        }
    }
}
