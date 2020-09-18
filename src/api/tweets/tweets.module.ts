import { ContainerModule, interfaces } from 'inversify';

import { TweetsService } from './services/tweets.service';
import { TweetsController } from './controllers/tweets.controller';
import { TweetsRepository } from './repositories/tweets.repository';
export const TweetsModule = new ContainerModule((bind: interfaces.Bind) => {
    bind(TweetsController).to(TweetsController);
    bind(TweetsService).to(TweetsService);
    bind(TweetsRepository).to(TweetsRepository);
});
