import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { EmailSchemaType } from './dto/create-email.dto';
import { UpdateEmailSchemaType } from './dto/update-email.dto';

@Injectable()
export class EmailtemplateService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    return await this.db.emailTemplate.findMany();
  }

  async findOne(id: string) {
    return await this.db.emailTemplate.findFirst({
      where: {
        id: id,
      },
    });
  }

  async create(body: EmailSchemaType) {
    return await this.db.emailTemplate.create({
      data: body,
    });
  }

  async update(id: string, body: UpdateEmailSchemaType) {
    return await this.db.emailTemplate.update({
      where: {
        id: id,
      },
      data: body,
    });
  }

  async delete(id: string) {
    return await this.db.emailTemplate.delete({
      where: {
        id: id,
      },
    });
  }
}
