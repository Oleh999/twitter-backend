import { ApiModel, ApiModelProperty } from 'swagger-express-typescript';
import { INTERNAL_SERVER_ERROR } from 'http-status-codes';

@ApiModel({
    description: 'Model of HttpError',
    name: 'HttpError',
})
export class HttpError extends Error {

    @ApiModelProperty({
        description: 'Response status',
        required: true,
        example: ['fail'],
    })
    public readonly status: string = 'fail';

    @ApiModelProperty({
        description: 'Error status code',
        required: true,
        example: [404, 400, 500],
    })
    public readonly code: number;

    @ApiModelProperty({
        description: 'Error message',
        required: true,
        example: ['Message Text'],
    })
    public readonly message: string;

    constructor(code: number, message: string) {
        super(message);
        if (!code) {
            this.code = INTERNAL_SERVER_ERROR;
        } else {
            this.code = code;
        }
    }
}
