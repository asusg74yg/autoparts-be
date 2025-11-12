import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateSupportSchemaType } from './dto/create-support.dto';
import { TicketStatus } from '@prisma/client';
import { UpdateSupportSchemaType } from './dto/update-support.dto';

@Injectable()
export class SupportService {
  constructor(private readonly db: DatabaseService) {}

  create(userId: string, body: CreateSupportSchemaType, files: string[]) {
    const payload = {
      ...body,
      userId,
      status: TicketStatus.OPEN,
    };
    return this.db.supportTicket.create({
      data: { ...payload, files: { create: { urls: files } } },
      include: {
        order: {
          where: { id: body.orderId },
          select: { shippingStatus: true, items: true },
        },
        files: { select: { urls: true } },
      },
    });
  }

  getAllByUserId(id: string) {
    return this.db.supportTicket.findMany({
      where: { userId: id },
      include: { order: { select: { shippingStatus: true, items: true } } },
    });
  }

  update(id: string, body: UpdateSupportSchemaType) {
    return this.db.supportTicket.update({
      where: { id },
      data: body,
      select: { status: true },
    });
  }

  findAll() {
    return this.db.supportTicket.findMany();
  }

  findOne(id: string) {
    return this.db.supportTicket.findUnique({
      where: { id },
      include: { order: true },
    });
  }

  remove(id: string) {
    return this.db.supportTicket.delete({ where: { id } });
  }
}
