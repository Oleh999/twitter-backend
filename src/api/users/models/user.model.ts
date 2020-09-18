import { Base } from '@typegoose/typegoose/lib/defaultClasses';
import { DocumentType, prop, Ref } from '@typegoose/typegoose';
import { CreateQuery } from 'mongoose';
import { ApiModel, ApiModelProperty } from 'swagger-express-typescript';

import { RolesEnum } from '../enums/users.enum';

@ApiModel({
    description: 'Model of user',
    name: 'User',
})
export class User extends Base {
    @ApiModelProperty({
        description: 'User firstname',
        required: true,
        example: ['ExampleName'],
    })
    @prop({ required: true })
    public firstName: string;

    @ApiModelProperty({
        description: 'User lastname',
        required: true,
        example: ['ExampleLastname'],
    })
    @prop({ required: true })
    public lastName: string;

    @ApiModelProperty({
        description: 'User username(nickname)',
        required: true,
        example: ['usernameExm1993'],
    })
    @prop({ required: true })
    public username: string;

    @ApiModelProperty({
        description: 'User hash-password',
        required: true,
        example: [
            '$2y$12$9wkUH.ZBln56GKtZXzAcD.YF7Y7t8uokV6LdnpSopNDE.tlYW6dpS',
        ],
    })
    @prop({ required: true })
    public password: string;

    @ApiModelProperty({
        description: 'User email',
        required: true,
        example: ['example@gmail.com'],
    })
    @prop({ required: true })
    public email: string;

    @ApiModelProperty({
        description: 'User avatar image',
        required: true,
        example: ['https://googledrive.com/images/my_avatar'],
    })
    @prop({ required: false })
    public avatar?: string;

    @ApiModelProperty({
        description:
            'User account status (eq. \'true\' when user confirm his email )',
        required: true,
        example: [true],
    })
    @prop({ required: false, default: false })
    public active?: boolean;

    @ApiModelProperty({
        description: 'User role: \'User\' = \'user\', \'Admin\' = \'admin\'',
        required: false,
        example: [['user', 'admin'], ['admin']],
    })
    @prop({ required: true, default: 'user' })
    public roles?: RolesEnum;

    @ApiModelProperty({
        description: 'List of followers usersId',
        required: false,
        example: [['5f423af74c9234267e6aa6ea', '5f423af74c9234267e6acccc']],
    })
    @prop({ ref: () => User, required: false, default: [] })
    public followers?: Ref<User>[];

    @ApiModelProperty({
        description: 'UserCreated time stamp',
        required: false,
        example: ['20200801'],
    })
    @prop({ required: false, default: Date.now() })
    public createdAt?: number;

    @ApiModelProperty({
        description: 'UserUpdated time stamp',
        required: false,
        example: ['20200823'],
    })
    @prop({ required: false, default: Date.now() })
    public lastUpdated?: number;

    @ApiModelProperty({
        description: 'Is user followed by current user',
        required: false,
        example: [false],
    })
    public isFollowed?: boolean;

    @ApiModelProperty({
        description: 'Is user follower of current user',
        required: false,
        example: [true],
    })
    public isFollower?: boolean;

    @ApiModelProperty({
        description: 'Number of people following current user',
        required: false,
        example: ['15'],
    })
    public followersCount?: number;

    @ApiModelProperty({
        description: 'Number of people followed by current user',
        required: false,
        example: ['24'],
    })
    public followingCount?: number;

    constructor(user: CreateQuery<User>) {
        super();
        Object.assign(this, user);
    }
}

export type DocumentUser = DocumentType<User>;
