import { DynamicModule, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueProviderFactory } from './queue-provider.factory';

@Module({})
export class QueueModule {
  static register(): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        {
          provide: 'QUEUE_PROVIDER',
          useFactory: () => QueueProviderFactory.create(),
        },
        QueueService,
      ],

      exports: ['QUEUE_PROVIDER', QueueService],
    };
  }
}
