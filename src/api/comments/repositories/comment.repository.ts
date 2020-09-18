import { injectable } from 'inversify';
import { ReturnModelType } from '@typegoose/typegoose';
import { CreateQuery, DocumentQuery, Types } from 'mongoose';
import { DatabaseConnection } from '../../../database/database-connection';
import { Comment, DocumentComment } from '../models/comment.model';
import { RepositoryBase } from '../../base/repository.base';
import { Principal } from '../../auth/models/principal.model';
import { UsersService } from '../../users/services/users.service';

@injectable()
export class CommentRepository extends RepositoryBase<Comment> {
    protected _repository: ReturnModelType<typeof Comment>;

    constructor(private _databaseConnection: DatabaseConnection,
                private _usersService: UsersService) {
        super();
        this.initRepository(this._databaseConnection, Comment);
    }

    public async findById(commentId: Types.ObjectId, principal?: Principal): Promise<DocumentComment> {
        const comment: DocumentComment = await this._repository
            .findById(commentId)
            .lean();
        return this._addFields(comment, principal);
    }

    public async findByTweet(
        tweetId: Types.ObjectId,
        principal?: Principal,
        skip?: number,
        limit?: number
    ): Promise<DocumentComment[]> {
        const findCommentsQuery: DocumentQuery<DocumentComment[], DocumentComment> = this._repository.find({ tweetId });
        return this._addLazyLoadAndModify(findCommentsQuery, principal, skip, limit);
    }

    public async findRepliesByCommentId(
        commentId: Types.ObjectId,
        principal?: Principal,
        skip?: number,
        limit?: number
    ) {
        const findCommentsQuery: DocumentQuery<DocumentComment[], DocumentComment> = this._repository
            .find({ repliedComment: commentId });
        return this._addLazyLoadAndModify(findCommentsQuery, principal, skip, limit);
    }

    public async createComment(comment: CreateQuery<Comment>, principal: Principal): Promise<DocumentComment> {
        const newComment: DocumentComment = await this._repository
            .create(comment);
        return this._addFields(newComment, principal);
    }

    public async updateComment(
        commentId: Types.ObjectId,
        text: string,
        principal: Principal
    ): Promise<DocumentComment> {
        const comment: DocumentComment = await this._repository
            .findByIdAndUpdate(
                commentId, {
                    $set: {
                        text,
                        lastEdited: Date.now()
                    }
                }, { new: true }
            )
            .lean();
        return this._addFields(comment, principal);
    }

    public async deleteComment(commentId: Types.ObjectId, principal: Principal): Promise<DocumentComment> {
        const replies: DocumentComment[] = await this._repository.find({ repliedComment: commentId });

        for (const reply of replies) {
            await this.deleteComment(reply._id, principal);
        }

        const comment: DocumentComment = await this._repository
            .findByIdAndDelete(commentId)
            .lean();
        return this._addFields(comment, principal);
    }

    public async likeComment(commentId: Types.ObjectId, principal: Principal): Promise<DocumentComment> {
        const comment: DocumentComment = await this._repository
            .findByIdAndUpdate(
                commentId,
                { $push: { likes: principal.details._id } },
                { new: true }
            )
            .lean();
        return this._addFields(comment, principal);
    }

    public async unlikeComment(commentId: Types.ObjectId, principal: Principal): Promise<DocumentComment> {
        const comment: DocumentComment = await this._repository
            .findByIdAndUpdate(
                commentId,
                { $pull: { likes: principal.details._id } },
                { new: true }
            ).lean();
        return this._addFields(comment, principal);
    }

    private async _addLazyLoadAndModify(
        findCommentQuery: DocumentQuery<DocumentComment[], DocumentComment>,
        principal?: Principal,
        skip?: number,
        limit?: number
    ): Promise<DocumentComment[]> {
        findCommentQuery.sort({ createdAt: -1 });

        if (skip) {
            findCommentQuery = findCommentQuery.skip(skip);
        }
        if (limit) {
            findCommentQuery = findCommentQuery.limit(limit);
        }
        return findCommentQuery
            .lean()
            .map(async (comments: DocumentComment[]) => {
                for (let i = 0; i < comments.length; i++) {
                    comments[i] = await this._addFields(comments[i], principal);
                }
                return comments;
            });
    }

    private async _addFields(comment: DocumentComment, principal?: Principal): Promise<DocumentComment> {
        if (principal && await principal.isAuthenticated()) {
            comment.isLiked = comment.likes.includes(principal.details._id);
            comment.isReplied = await this._repository.exists({
                authorId: principal.details._id,
                repliedComment: comment._id
            });
        }

        comment.likesCount = comment.likes.length;
        comment.repliesCount = await this._repository.count({ repliedComment: comment._id });
        comment.likes = await this._usersService.findUsersByUserIds(comment.likes as Types.ObjectId[], principal, 0, 5);
        comment.replies = [];

        const replies: DocumentComment[] = await this._repository
            .find({ repliedComment: comment._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        for (const reply of replies) {
            comment.replies.push(
                await this._addFields(reply, principal)
            );
        }

        return comment;
    }
}

