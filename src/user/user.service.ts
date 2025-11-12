import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  async findAll() {
    return await this.db.user.findMany({
      omit: {
        passwordHash: true,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.db.user.findFirst({ where: { email: email } });
  }

  async findOneByID(id: string): Promise<User | null> {
    return this.db.user.findFirst({ where: { id: id } });
  }

  async createUser(body: Prisma.UserCreateInput): Promise<User> {
    return await this.db.user.create({ data: body });
  }

  async updateUser(id: string, body: Prisma.UserUpdateInput): Promise<User> {
    return await this.db.user.update({ where: { id: id }, data: body });
  }

  async deleteUser(id: string): Promise<User> {
    return await this.db.user.delete({ where: { id: id } });
  }
}
