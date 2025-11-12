import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PromotionService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    return await this.db.promotion.findMany();
  }
  async findOne(id: string) {
    return await this.db.promotion.findUnique({ where: { id } });
  }
  async create(body) {
    return await this.db.promotion.create({ data: body });
  }
  async update(id: string, body) {
    return await this.db.promotion.update({ where: { id }, data: body });
  }
  async delete(id: string) {
    const promotion = await this.db.promotion.findUnique({ where: { id } });
    if (!promotion) throw new Error('Promotion not found');
    return await this.db.promotion.delete({ where: { id } });
  }
}
