import { injectable } from 'inversify';
import { CreateQuery, Types, UpdateQuery } from 'mongoose';
import { FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND } from 'http-status-codes';

import { TweetsRepository } from '../repositories/tweets.repository';
import { DocumentTweet, Tweet } from '../models/tweet.model';
import { Principal } from '../../auth/models/principal.model';
import { DocumentUser } from '../../users/models/user.model';
import { UsersService } from '../../users/services/users.service';
import { HttpError } from '../../../shared/models/http.error';

@injectable()
export class TweetsService {
    constructor(
        private _tweetsRepository: TweetsRepository,
        private _usersService: UsersService
    ) {
    }

    public async createTweet(tweet: CreateQuery<Tweet>): Promise<DocumentTweet> {
        return this._tweetsRepository.createTweet(tweet);
    }

    public async updateTweet(tweet: UpdateQuery<Tweet>, principal: Principal): Promise<DocumentTweet> {
        const tweetToUpdate: DocumentTweet = await this._tweetsRepository.findById(tweet._id, principal);

        if (tweetToUpdate.authorId.toLocaleString() !== principal.details._id.toHexString()) {
            throw new HttpError(FORBIDDEN, 'Not an owner of a tweet');
        }
        if (!tweetToUpdate) {
            throw new HttpError(NOT_FOUND, 'Tweet not found');
        }
        try {
            return this._tweetsRepository.updateTweet(tweet, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async deleteTweet(id: Types.ObjectId): Promise<DocumentTweet> {
        try {
            return this._tweetsRepository.deleteTweet(id);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findById(id: Types.ObjectId, principal: Principal): Promise<DocumentTweet> {
        try {
            return this._tweetsRepository.findById(id, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findTweetsByAuthorId(authorId: Types.ObjectId, principal: Principal, skip: number, limit: number): Promise<DocumentTweet[]> {
        try {
            return this._tweetsRepository.findTweetsByAuthorsIds([authorId], principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findTweetsByFollowing(principal: Principal, skip: number, limit: number): Promise<DocumentTweet[]> {
        try {
            const authorsIds: Types.ObjectId[] = (await this._usersService.findFollows(principal.details._id, principal))
                .map((user: DocumentUser) => user._id);
            return this._tweetsRepository.findTweetsByAuthorsIds(authorsIds, principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findRetweetsByTweetId(id: Types.ObjectId, principal: Principal, skip?: number, limit?: number): Promise<DocumentTweet[]> {
        try {
            return this._tweetsRepository.findRetweetsByTweetId(id, principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findLikersByTweetId(id: Types.ObjectId, principal: Principal, skip: number, limit: number): Promise<DocumentUser[]> {
        const tweet: DocumentTweet = await this._tweetsRepository.findById(id, principal);
        if (!tweet) {
            throw new HttpError(NOT_FOUND, 'Tweet not found');
        }
        try {
            return this._tweetsRepository.findLikersByTweetId(tweet.likes as Types.ObjectId[], principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async likeTweet(userId: Types.ObjectId, tweetIdToLike: Types.ObjectId): Promise<DocumentTweet> {
        try {
            return this._tweetsRepository.likeTweet(userId, tweetIdToLike);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async unlikeTweet(userId: Types.ObjectId, tweetIdToLike: Types.ObjectId): Promise<DocumentTweet> {
        try {
            return this._tweetsRepository.unlikeTweet(userId, tweetIdToLike);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }
}
