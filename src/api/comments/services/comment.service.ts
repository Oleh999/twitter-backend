import {injectable} from 'inversify';
import {CommentRepository} from '../repositories/comment.repository';
import {Comment, DocumentComment} from '../models/comment.model';
import {Types} from 'mongoose';
import {Principal} from '../../auth/models/principal.model';
import {HttpError} from '../../../shared/models/http.error';
import {FORBIDDEN, INTERNAL_SERVER_ERROR, NOT_FOUND, UNPROCESSABLE_ENTITY} from 'http-status-codes';
import {TweetsService} from '../../tweets/services/tweets.service';
import {DocumentTweet} from '../../tweets/models/tweet.model';
import {DocumentUser} from '../../users/models/user.model';
import {UsersService} from '../../users/services/users.service';

@injectable()
export class CommentService {
    constructor(private _commentRepository: CommentRepository,
                private _tweetService: TweetsService,
                private _usersService: UsersService) {
    }

    public async findById(id: Types.ObjectId, principal: Principal): Promise<DocumentComment> {
        return this._commentRepository.findById(id, principal);
    }

    public async findCommentsByTweet(tweetId: Types.ObjectId, principal: Principal, skip: number, limit: number): Promise<DocumentComment[]> {
        const tweet: DocumentTweet = await this._tweetService.findById(tweetId, principal);

        if (!tweet) {
            throw new HttpError(NOT_FOUND, 'Tweet not found');
        }

        try {
            return this._commentRepository.findByTweet(tweetId, principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findRepliedComments(id: Types.ObjectId, principal?: Principal, skip?: number, limit?: number) {
        try {
            return this._commentRepository.findRepliesByCommentId(id, principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async createComment(text: string, principal: Principal, tweetId: Types.ObjectId): Promise<DocumentComment> {
        const tweet: DocumentTweet = await this._tweetService.findById(tweetId, principal);

        if (!tweet) {
            throw new HttpError(NOT_FOUND, 'Tweet not found');
        }

        return this._commentRepository.createComment(
            new Comment({
                authorId: principal.details._id,
                tweetId: tweetId,
                text
            }),
            principal
        );
    }

    public async updateComment(id: Types.ObjectId, text: string, principal: Principal): Promise<DocumentComment> {
        const comment: DocumentComment = await this._commentRepository.findById(id, principal);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        if (comment.authorId.toLocaleString() !== principal.details._id.toHexString()) {
            throw new HttpError(FORBIDDEN, 'Not an owner of a tweet');
        }

        try {
            return this._commentRepository.updateComment(comment._id, text, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async deleteComment(principal: Principal, id: Types.ObjectId): Promise<DocumentComment> {
        const comment: DocumentComment = await this._commentRepository.findById(id, principal);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        if (comment.authorId.toLocaleString() !== principal.details._id.toHexString()) {
            throw new HttpError(FORBIDDEN, 'Not an owner of a tweet');
        }

        try {
            return this._commentRepository.deleteComment(id, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async likeComment(principal: Principal, commentId: Types.ObjectId): Promise<DocumentComment> {
        const comment: DocumentComment = await this._commentRepository.findById(commentId);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        if (comment.likes.includes(principal.details._id)) {
            throw new HttpError(UNPROCESSABLE_ENTITY, 'Already liked');
        }

        try {
            return this._commentRepository.likeComment(commentId, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async unlikeComment(principal: Principal, commentId: Types.ObjectId): Promise<DocumentComment> {
        const comment: DocumentComment = await this._commentRepository.findById(commentId);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        if (!comment.likes.includes(principal.details._id)) {
            throw new HttpError(UNPROCESSABLE_ENTITY, 'Already unliked');
        }

        try {
            return this._commentRepository.unlikeComment(commentId, principal);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }


    public async replyComment(text: string, principal: Principal, repliedCommentId: Types.ObjectId) {
        const comment: DocumentComment = await this._commentRepository.findById(repliedCommentId);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        try {
            return this._commentRepository.createComment(
                new Comment({
                    text,
                    authorId: principal.details._id,
                    repliedComment: comment._id,
                }),
                principal
            );
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }

    public async findLikersByCommentId(id: Types.ObjectId, principal: Principal, skip: number, limit: number): Promise<DocumentUser[]> {
        const comment: DocumentComment = await this._commentRepository.findById(id);

        if (!comment) {
            throw new HttpError(NOT_FOUND, 'Comment not found');
        }

        try {
            return this._usersService.findUsersByUserIds(comment.likes as Types.ObjectId[], principal, skip, limit);
        } catch (error) {
            throw new HttpError(INTERNAL_SERVER_ERROR, error.message);
        }
    }
}
