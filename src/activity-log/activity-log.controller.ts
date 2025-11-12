import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ActivityLogService } from './activity-log.service';

@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @MessagePattern('append_log')
  async appendLog(@Payload() payload: any) {
    return await this.activityLogService.create(payload.data);
  }

  @Get()
  findAll() {
    return this.activityLogService.findAll();
  }

  @Get('user/:id')
  findByUserId(@Param('id') id: string) {
    return this.activityLogService.findByUserId(id);
  }

  @Post('user/:id/dates')
  findByUserIdAndDates(
    @Param('id') id: string,
    @Body() body: { from: Date; to: Date },
  ) {
    const { from, to } = body;
    return this.activityLogService.findByUserIdAndDates(id, from, to);
  }
}
