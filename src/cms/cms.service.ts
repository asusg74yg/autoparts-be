import { Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { CmsSchemaType } from './dto/create-cms.dto';
import { UpdateCmsSchemaType } from './dto/update-cms.dto';

@Injectable()
export class CmsService {
  constructor(private db: DatabaseService) {}

  async findAll() {
    return await this.db.cmsPage.findMany();
  }

  async findOne(id: string) {
    return await this.db.cmsPage.findUnique({
      where: {
        id,
      },
    });
  }
  async create(data: CmsSchemaType) {
    return await this.db.cmsPage.create({
      data,
    });
  }
  async findOneBySlug(slug: string) {
    return await this.db.cmsPage.findFirst({
      where: {
        slug,
      },
    });
  }

  async update(id: string, data: UpdateCmsSchemaType) {
    return await this.db.cmsPage.update({
      where: {
        id: id,
      },
      data,
    });
  }

  async delete(id: string) {
    return await this.db.cmsPage.delete({
      where: {
        id: id,
      },
    });
  }
}
