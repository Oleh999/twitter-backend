import {Base} from '@typegoose/typegoose/lib/defaultClasses';
import {DocumentType, prop, Ref} from '@typegoose/typegoose';
import {CreateQuery} from 'mongoose';
import { ApiModel, ApiModelProperty, SwaggerDefinitionConstant } from 'swagger-express-typescript';
import {User} from '../../users/models/user.model';
import {Tweet} from '../../tweets/models/tweet.model';

@ApiModel({
    description: 'Model of Comment',
    name: 'Comment',
})
export class Comment extends Base {
    @ApiModelProperty({
        description: 'Author id of comment',
        required: true,
        example: ['5f423af74c9234267e6aa6ea'],
        type: SwaggerDefinitionConstant.Response.Type.STRING,
    })
    @prop({required: true})
    public authorId: Ref<User>;

    @ApiModelProperty({
        description: 'Tweet id of comment',
        required: false,
        example: ['5f423af74c9234267e6aa6ea'],
        type: SwaggerDefinitionConstant.Response.Type.STRING,
    })
    @prop({required: false})
    public tweetId?: Ref<Tweet>;

    @ApiModelProperty({
        description: 'Text of comment',
        required: true,
        example: ['some comment..'],
        type: SwaggerDefinitionConstant.Response.Type.STRING,
    })
    @prop({required: true})
    public text: string;

    @ApiModelProperty({
        description: 'Id of replied comment',
        required: false,
        example: ['5f423af74c9234267e6aa6ea'],
        type: SwaggerDefinitionConstant.Response.Type.STRING,
    })
    @prop({required: false})
    public repliedComment?: Ref<Comment>;

    @ApiModelProperty({
        description: 'Likes array of comment',
        required: false,
        example: [['5f423af74c9234267e6aa6ea', '3r423af74c95f4267e6ak612']],
        type: SwaggerDefinitionConstant.Response.Type.STRING,

    })
    @prop({ref: () => User, required: false, default: []})
    public likes?: Ref<User>[];

    @ApiModelProperty({
        description: 'Comment creation time stamp',
        required: false,
        example: ['1599137650207'],
        type: SwaggerDefinitionConstant.Response.Type.NUMBER,
    })
    @prop({required: false, default: Date.now()})
    public createdAt?: number;

    @ApiModelProperty({
        description: 'Time stamp of last comment edition',
        required: false,
        example: ['1599137650207'],
        type: SwaggerDefinitionConstant.Response.Type.NUMBER,
    })
    @prop({required: false, default: Date.now()})
    public lastEdited?: number;

    @ApiModelProperty({
        description: 'Number of likes',
        required: false,
        example: ['3', '15'],
        type: SwaggerDefinitionConstant.Response.Type.NUMBER,
    })
    public likesCount?: number;

    @ApiModelProperty({
        description: 'Is liked by current user',
        required: false,
        example: ['true', 'false'],
        type: SwaggerDefinitionConstant.Response.Type.BOOLEAN,
    })
    public isLiked?: boolean;

    @ApiModelProperty({
        description: 'Number of replies',
        required: false,
        example: ['3', '15'],
        type: SwaggerDefinitionConstant.Response.Type.NUMBER,
    })
    public repliesCount?: number;

    @ApiModelProperty({
        description: 'Replies',
        required: false,
        model: 'Comment',
        type: SwaggerDefinitionConstant.Response.Type.ARRAY,
    })
    public replies?: DocumentComment[];

    @ApiModelProperty({
        description: 'Is comment replied current user',
        required: false,
        example: ['true', 'false'],
        type: SwaggerDefinitionConstant.Response.Type.BOOLEAN,
    })
    public isReplied?: boolean;

    constructor(comment: CreateQuery<Comment>) {
        super();
        this.likes = [];
        this.likesCount = 0;
        this.isLiked = false;
        this.replies = [];
        this.repliesCount = 0;
        this.isReplied = false;
        Object.assign(this, comment);
    }
}

export type DocumentComment = DocumentType<Comment>;
