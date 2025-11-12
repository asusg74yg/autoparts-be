import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { ActivityLogSchemaType } from './dto/create-activitylog.dto';

@Injectable()
export class ActivityLogService {
  constructor(private db: DatabaseService) {}
  async findAll() {
    return await this.db.activityLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByEvent(event: string) {
    return await this.db.activityLog.findMany({
      where: {
        action: event,
      },
    });
  }

  async findByUserId(id: string) {
    return await this.db.activityLog.findMany({
      where: {
        actorId: id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findByUserIdAndDates(id: string, from: Date, to: Date) {
    return await this.db.activityLog.findMany({
      where: {
        actorId: id,
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: ActivityLogSchemaType) {
    return await this.db.activityLog.create({
      data,
    });
  }
}
