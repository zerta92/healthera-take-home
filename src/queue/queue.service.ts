import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import * as amqp from 'amqplib';

@Injectable()
export class QueueService {
  private connection: amqp.Connection | null = null;
  private isSubscribed: boolean = false; // Flag to track subscription
  constructor(@Inject('QUEUE_PROVIDER') private readonly queueProvider: any) {}

  async publishMessage(message: string): Promise<void> {
    if (this.queueProvider instanceof SQSClient) {
      const command = new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL,
        MessageBody: message,
      });
      await this.queueProvider.send(command);
    } else {
      const channel = await this.queueProvider.createChannel();
      await channel.assertQueue('my-queue', { durable: true });
      await channel.sendToQueue('my-queue', Buffer.from(message), {
        persistent: true,
      });
    }
  }

  async subscribeToMessages(): Promise<void> {
    if (this.isSubscribed) {
      console.log('Already subscribed to messages. Skipping subscription.');
      return;
    }
    this.isSubscribed = true;
    if (this.queueProvider instanceof SQSClient) {
      var sqs = this.queueProvider;
      const configService = new ConfigService();

      const queueUrl = configService.get<string>('SQS_QUEUE_URL');

      const receiveParams = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 1, // Receive a single message
        WaitTimeSeconds: 20, // Long polling for 20 seconds
      };

      setInterval(async () => {
        try {
          const data = await this.queueProvider.send(
            new ReceiveMessageCommand(receiveParams),
          );

          if (data.Messages && data.Messages.length > 0) {
            for (const message of data.Messages) {
              console.log('Received message:', message.Body);

              await this.queueProvider.send(
                new DeleteMessageCommand({
                  QueueUrl: queueUrl,
                  ReceiptHandle: message.ReceiptHandle,
                }),
              );
            }
          }
        } catch (error) {
          console.error('Error receiving messages:', error);
        }
      }, 2000);
    } else {
      const channel = await this.queueProvider.createChannel();
      await channel.assertQueue('my-queue', { durable: true });
      channel.consume(
        'my-queue',
        (msg) => {
          if (msg !== null) {
            console.log('Received:', msg.content.toString());
            channel.ack(msg);
          } else {
            console.log('No Message');
          }
        },
        { noAck: false }, // disable automatic acknowledgment mode
      );
    }
  }

  async unsubscribe(): Promise<void> {
    this.isSubscribed = false;
  }
}
