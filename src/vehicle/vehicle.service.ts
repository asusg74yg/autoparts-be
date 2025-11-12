import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Vehicle } from './dto/createVehicle.dto';

@Injectable()
export class VehicleService {
  constructor(private db: DatabaseService) {}

  findAll(id: string) {
    return this.db.vehicle.findMany({
      where: {
        user: {
          id,
        },
      },
    });
  }

  create(user: any, createVehicleDto: Vehicle): Promise<Vehicle> {
    // const payload = { userId: user.id, ...createVehicleDto };
    return this.db.vehicle.create({
      data: {
        user: { connect: { id: user.id } },

        ...createVehicleDto,
      },
    });
  }

  update(
    id: string,
    updateVehicleDto: Partial<Vehicle>,
  ): Promise<Partial<Vehicle>> {
    return this.db.vehicle.update({
      where: {
        id,
      },
      data: updateVehicleDto,
    });
  }

  async remove(id: string) {
    const record = await this.db.vehicle.findUnique({
      where: {
        id,
      },
    });

    if (!record)
      throw new HttpException('Vehicle Not Found', HttpStatus.NOT_FOUND);

    return this.db.vehicle.delete({
      where: {
        id,
      },
    });
  }
}
