import { Controller, Post, Body } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('queue')
export class QueueController {
  constructor(private readonly queueService: QueueService) {}

  @Post('publish')
  async publish(@Body('message') message: string): Promise<string> {
    await this.queueService.publishMessage(message);
    return 'Message Added';
  }

  @Post('subscribe')
  async subscribe(): Promise<string> {
    await this.queueService.subscribeToMessages();
    return 'Subscribed';
  }
}
