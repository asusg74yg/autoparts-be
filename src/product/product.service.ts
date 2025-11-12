import { Injectable } from '@nestjs/common';

import { DatabaseService } from 'src/database/database.service';
// import { ProductSchemaType } from './dto/create-product.dto';
// import { UpdateProductSchemaType } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private db: DatabaseService) {}
  async findAllLists() {
    const baseVehicles = await this.db.baseVehicle.findMany();
    const years = new Set();
    const makes = new Set();
    const models = new Set();

    baseVehicles.forEach((item) => {
      years.add(item.year);
      makes.add(item.make);
      models.add(item.model);
    });

    return {
      years: Array.from(years).sort((a: number, b: number) => b - a),
      makes: Array.from(makes).sort((a: string, b: string) => {
        return a.localeCompare(b);
      }),
      models: Array.from(models).sort((a: string, b: string) => {
        return a.localeCompare(b);
      }),
    };
  }
  async findAll() {
    const products = await this.db.product.findMany({
      include: {
        baseVehicle: true,
        partType: true,
      },
    });
    const response = await Promise.all(
      products.map(async (product) => {
        const partType = await this.db.partType.findUnique({
          where: {
            id: product.partTypeId || '',
          },
        });
        return {
          ...product,
          partType,
        };
      }),
    );
    return response;
  }

  async findProduct(partNumber: string, partName: string) {
    let whereClause = {};
    if (partNumber) {
      whereClause = {
        partNumber: {
          equals: partNumber,
        },
      };
      return await this.db.product.findMany({
        where: whereClause,
        include: {
          baseVehicle: true,
          // partType: true,
          // productDescription: true,
          pricing: {
            where: {
              priceType: 'Wholesale MAP',
            },
          },
          digitalAssets: true,
        },
        take: 1,
      });
    }
    if (partName) {
      whereClause = {
        mfrLabel: {
          contains: partName,
          mode: 'insensitive',
        },
      };
      return await this.db.product.findMany({
        where: whereClause,
        include: {
          baseVehicle: true,
          partType: true,
          productDescription: true,
          pricing: {
            where: {
              priceType: 'Wholesale MAP',
            },
          },
          digitalAssets: true,
        },
        take: 15,
      });
    }
  }

  async findOne(id: string) {
    return await this.db.product.findUnique({
      where: {
        id,
      },
      include: {
        baseVehicle: true,
        partType: true,
        productDescription: true,
        fuelType: true,
        engineBase: true,
        pricing: {
          where: {
            priceType: 'Wholesale MAP',
          },
        },
        digitalAssets: true,
      },
    });
  }

  async getAllMakes() {
    return await this.db.baseVehicle.findMany({
      distinct: ['make'],
      select: {
        make: true,
      },
      orderBy: {
        make: 'asc',
      },
    });
  }

  async getYearsByMake(make: string) {
    return await this.db.baseVehicle.findMany({
      where: {
        make,
      },
      distinct: ['year'],
      select: {
        year: true,
      },
      orderBy: {
        year: 'desc',
      },
    });
  }

  async getModelsByMakeAndYear(make: string, year: number) {
    return await this.db.baseVehicle.findMany({
      where: {
        make,
        year,
      },
      distinct: ['model'],
      select: {
        model: true,
      },
      orderBy: {
        model: 'asc',
      },
    });
  }

  async getCategoriesByMakeYearModel(
    make?: string,
    year?: number,
    model?: string,
  ) {
    let whereClause = {};
    if (make) {
      // whereClause['make'] = make.replaceAll('_', ' ');
      whereClause = {
        make: {
          contains: make,
          mode: 'insensitive',
        },
      };
    }
    if (year) {
      whereClause = {
        year: {
          contains: year,
          mode: 'insensitive',
        },
      };
    }

    if (model) {
      whereClause = {
        model: {
          contains: model,
          mode: 'insensitive',
        },
      };
    }
    const products = await this.db.product.findMany({
      where: {
        baseVehicle: whereClause,
      },
      include: {
        baseVehicle: true,
        partType: true,
        productDescription: true,
        pricing: {
          where: {
            priceType: 'Wholesale MAP',
          },
        },
        digitalAssets: true,
      },
    });
    const response = await Promise.all(
      products.map(async (item) => {
        const partType = await this.db.partType.findUnique({
          where: {
            id: item.partTypeId || '',
          },
        });
        return {
          ...item,
          partType,
        };
      }),
    );
    const categories = new Set<string>();
    response.forEach((item) => {
      if (item.partType?.category) {
        categories.add(item.partType.category);
      }
    });
    const categoriesInfo = await Promise.all(
      Array.from(categories).map(async (category) => {
        const subCategories = await this.db.partType.findMany({
          where: {
            category: category,
          },
          distinct: ['subcategory'],
          select: {
            subcategory: true,
          },
        });
        return {
          category: category,
          subCategories,
        };
      }),
    );
    return {
      totalProducts: response.length || 0,
      totalCateogries: categoriesInfo.length || 0,
      categories: categoriesInfo,
      products: response,
    };
  }

  //   async create(data: ProductSchemaType) {
  //     const {
  //       productDescriptions,
  //       pricing,
  //       productAttributes,
  //       extendedProductInformation,
  //       package: packageData,
  //       digitalAssets,
  //       partType,
  //       ...productData
  //     } = data;

  //     return await this.db.product.create({
  //       data: {
  //         ...productData,
  //         productDescription: productDescriptions
  //           ? {
  //               create: productDescriptions,
  //             }
  //           : undefined,
  //         pricing: pricing
  //           ? {
  //               create: pricing,
  //             }
  //           : undefined,
  //         productAttributes: productAttributes
  //           ? {
  //               create: productAttributes,
  //             }
  //           : undefined,
  //         extendedProductInformation: extendedProductInformation
  //           ? {
  //               create: extendedProductInformation,
  //             }
  //           : undefined,
  //         package: packageData
  //           ? {
  //               create: packageData,
  //             }
  //           : undefined,
  //         digitalAssets: digitalAssets
  //           ? {
  //               create: digitalAssets,
  //             }
  //           : undefined,
  //         partType: partType
  //           ? {
  //               create: partType,
  //             }
  //           : undefined,
  //       },
  //     });
  //   }

  //   async update(id: string, data: UpdateProductSchemaType) {
  //     const {
  //       productDescriptions,
  //       pricing,
  //       productAttributes,
  //       extendedProductInformation,
  //       package: packageData,
  //       digitalAssets,
  //       partType,
  //       ...productData
  //     } = data;

  //     return await this.db.product.update({
  //       where: {
  //         id,
  //       },
  //       data: {
  //         ...productData,
  //         baseVehicle: productData.baseVehicleId
  //           ? {
  //               connect: {
  //                 base: productData.baseVehicleId,
  //               },
  //             }
  //           : undefined,

  //         productDescription: productDescriptions
  //           ? {
  //               deleteMany: {},
  //               create: productDescriptions,
  //             }
  //           : undefined,
  //         pricing: pricing
  //           ? {
  //               deleteMany: {},
  //               create: pricing,
  //             }
  //           : undefined,
  //         productAttributes: productAttributes
  //           ? {
  //               deleteMany: {},
  //               create: productAttributes,
  //             }
  //           : undefined,
  //         extendedProductInformation: extendedProductInformation
  //           ? {
  //               deleteMany: {},
  //               create: extendedProductInformation,
  //             }
  //           : undefined,
  //         package: packageData
  //           ? {
  //               upsert: {
  //                 create: packageData,
  //                 update: packageData,
  //               },
  //             }
  //           : undefined,
  //         digitalAssets: digitalAssets
  //           ? {
  //               deleteMany: {},
  //               create: digitalAssets,
  //             }
  //           : undefined,
  //         partType: partType
  //           ? {
  //               upsert: {
  //                 create: partType,
  //                 update: partType,
  //               },
  //             }
  //           : undefined,
  //       },
  //     });
  //   }

  async delete(id: string) {
    return await this.db.product.delete({
      where: {
        id,
      },
    });
  }
}
