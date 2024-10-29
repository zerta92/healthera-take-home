import { ConfigService } from '@nestjs/config';
import { SQSClient } from '@aws-sdk/client-sqs';
import * as amqp from 'amqplib';

export class QueueProviderFactory {
  static async create() {
    const configService = new ConfigService();
    const provider = configService.get<string>('QUEUE_PROVIDER');

    if (provider === 'SQS') {
      const region = configService.get<string>('AWS_REGION');
      const accesskey = configService.get<string>('AWS_ACCESS_KEY_ID');
      const secretKey = configService.get<string>('AWS_SECRET_ACCESS_KEY');
      return new SQSClient({
        region: region || 'eu-central-1',
        endpoint: configService.get<string>('LOCALSTACK_SQS_ENDPOINT'),
        credentials: {
          accessKeyId: accesskey || 'dummy',
          secretAccessKey: secretKey || 'dummy',
        },
      });
    } else if (provider === 'RABBITMQ') {
      const url = configService.get<string>('RABBITMQ_URL');

      const queue = await amqp.connect(url);

      return queue;
    }

    throw new Error('No valid queue provider selected');
  }
}
