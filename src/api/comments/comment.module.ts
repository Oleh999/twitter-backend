import { ContainerModule, interfaces } from 'inversify';

import {CommentRepository} from './repositories/comment.repository';
import {CommentService} from './services/comment.service';
import {CommentController} from './controllers/comment.controller';

export const CommentsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind(CommentRepository).to(CommentRepository);
    bind(CommentService).to(CommentService);
    bind(CommentController).to(CommentController);
});
