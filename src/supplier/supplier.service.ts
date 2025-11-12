import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { SupplierSchemaType } from './dto/create-supplier.dto';

@Injectable()
export class SupplierService {
  constructor(private db: DatabaseService) {}

  async create(body: SupplierSchemaType) {
    return await this.db.supplier.create({ data: body });
  }

  async findAll() {
    return await this.db.supplier.findMany();
  }

  async findOne(id: string) {
    return await this.db.supplier.findFirst({ where: { id: id } });
  }

  async update(id: string, body) {
    return await this.db.supplier.update({ where: { id: id }, data: body });
  }

  async delete(id: string) {
    return await this.db.supplier.delete({ where: { id: id } });
  }
}
