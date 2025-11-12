import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { Product } from './types/aces_pies';
import { acesPiesConvertor } from 'common/aces-pies/main';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class AcespiesService {
  private readonly logger = new Logger(`AcespiesService`);
  constructor(
    private db: DatabaseService,
    @Inject('ACES_SERVICE') private acesClient: ClientProxy,
  ) {}

  async handleAcesPiesCreation(data: Product) {
    await this.db.$transaction(
      async (trx) => {
        this.logger.log(`Processing ${data.PartNumber}`);
        let baseVehicle = await trx.baseVehicle.findFirst({
          where: {
            baseVehicleID: data.BaseVehicle.id,
          },
        });

        if (!baseVehicle) {
          baseVehicle = await trx.baseVehicle.create({
            data: {
              baseVehicleID: data.BaseVehicle.id,
              vehicleType: data.BaseVehicle.data.VehicleType,
              vehicleTypeGroup: data.BaseVehicle.data.VehicleTypeGroup,
              year: data.BaseVehicle.data.Year,
              make: data.BaseVehicle.data.Make,
              model: data.BaseVehicle.data.Model,
              subModels: {
                createMany: {
                  data: data.BaseVehicle.data.SubModels.map((subModel) => ({
                    subModel: subModel.subModel,
                    regionAbbr: subModel.region.RegionAbbr,
                    region: subModel.region.RegionName,
                  })),
                },
              },
            },
          });
        }
        let engineBase = await trx.engineBase.findFirst({
          where: {
            engineBaseID: data.EngineBase.id,
          },
        });
        if (!engineBase) {
          engineBase = await trx.engineBase.create({
            data: {
              engineBaseID: data.EngineBase.id,
              liter: data.EngineBase.data.EngineBase.Liter,
              cc: data.EngineBase.data.EngineBase.CC,
              cid: data.EngineBase.data.EngineBase.CID,
              cylinders: data.EngineBase.data.EngineBase.Cylinders,
              blockType: data.EngineBase.data.EngineBase.BlockType,
              engBoreIn: data.EngineBase.data.EngineBase.EngBoreIn,
              engBoreMetric: data.EngineBase.data.EngineBase.EngBoreMetric,
              engStrokeIn: data.EngineBase.data.EngineBase.EngStrokeIn,
              engStrokeMetric: data.EngineBase.data.EngineBase.EngStrokeMetric,
            },
          });
        }

        let engineDesignation = await trx.engineDesignation.findFirst({
          where: {
            EngineDesignationID: data.EngineDesignation.id,
          },
        });
        if (!engineDesignation) {
          engineDesignation = await trx.engineDesignation.create({
            data: {
              EngineDesignationID: data.EngineDesignation.id,
              engineDesignation: data.EngineDesignation.data.EngineDesignation,
            },
          });
        }

        let engineVersion = await trx.engineVersion.findFirst({
          where: {
            EngineVersionID: data.EngineVersion.id,
          },
        });
        if (!engineVersion) {
          engineVersion = await trx.engineVersion.create({
            data: {
              EngineVersionID: data.EngineVersion.id,
              engineVersion: data.EngineVersion.data.EngineVersion,
            },
          });
        }

        let engineMfr = await trx.engineMfr.findFirst({
          where: {
            EngineMfrID: data.EngineMfr.id,
          },
        });
        if (!engineMfr) {
          engineMfr = await trx.engineMfr.create({
            data: {
              EngineMfrID: data.EngineMfr.id,
              engineMfr: data.EngineMfr.data.EngineMfr,
            },
          });
        }

        let fuelType = await trx.fuelType.findFirst({
          where: {
            fuelType: data.FuelType.data.FuelType,
          },
        });
        if (!fuelType) {
          fuelType = await trx.fuelType.create({
            data: {
              FuelTypeID: data.FuelType.id,
              fuelType: data.FuelType.data.FuelType,
            },
          });
        }

        let brandAAIAID = await trx.brandAAIAID.findFirst({
          where: {
            brandAAIAIDID: data.BrandAAIAID.data.BrandID,
          },
        });
        if (!brandAAIAID) {
          brandAAIAID = await trx.brandAAIAID.create({
            data: {
              brandAAIAIDID: data.BrandAAIAID.data.BrandID,
              brandAAIAID: data.BrandAAIAID.data.BrandName,
            },
          });
        }

        let partType = await trx.partType.findFirst({
          where: {
            partTypeID: data.PartType.id,
          },
        });
        if (!partType) {
          partType = await trx.partType.create({
            data: {
              partTypeID: data.PartType.id,
              partTypeName: data.PartType.data.PartTypeName,
              partTypeDescription: data.PartType.data.PartTypeDescription,
              category: data.PartType.data.Category,
              subcategory: data.PartType.data.Subcategory,
            },
          });
        }

        let product = await trx.product.findFirst({
          where: {
            partNumber: data.PartNumber,
          },
        });

        if (!product) {
          product = await trx.product.create({
            data: {
              mfrLabel: data.MfrLabel,
              part: data.Part,
              action: data.action,
              hazardMaterialCode: data.HazardousMaterialCode,
              partNumber: data.PartNumber,
              brandLabel: data.BrandLabel,
              acesApplications: data.ACESApplications,
              itemQuantitySize: data.ItemQuantitySize._text,
              containerType: data.ContainerType,
              quantityPerApplication: data.QuantityPerApplication._text,
              minimumOrderQuantity: data.MinimumOrderQuantity._text,
              partTerminologyId: data.PartTerminologyID,
              maintenanceType: data.MaintenanceType,
              baseVehicleId: baseVehicle?.id,
              engineBaseId: engineBase?.id,
              engineDesignationId: engineDesignation?.id,
              engineVersionId: engineVersion?.id,
              engineMfrId: engineMfr?.id,
              fuelTypeId: fuelType?.id,
              brandAAIAIDId: brandAAIAID?.id,
              partTypeId: partType?.id,
              productDescription: {
                createMany: {
                  data: data.Descriptions.Description.map((e) => ({
                    descriptionText: e._text,
                    descriptionCode: e.DescriptionCode,
                    maintenanceType: e.MaintenanceType,
                    languageCode: e.LanguageCode,
                    sequence: Number(e.Sequence) || -1,
                  })),
                },
              },
              productAttributes: {
                createMany: {
                  data: data.ProductAttributes.ProductAttribute.map((e) => ({
                    attributeID: e.AttributeID,
                    padbAttribute: e.PADBAttribute,
                    recordNumber: Number(e.RecordNumber),
                    multiValueQuantity: Number(e.MultiValueQuantity),
                    multiValueSequence: Number(e.MultiValueSequence),
                    languageCode: e.LanguageCode,
                  })),
                },
              },
              extendedProductInformation: {
                createMany: {
                  data: data.ExtendedInformation.ExtendedProductInformation.map(
                    (e) => ({
                      expiCode: e.EXPICode,
                      descriptionText: e._text.toString(),
                      maintenanceType: e.MaintenanceType,
                      languageCode: e.LanguageCode,
                    }),
                  ),
                },
              },
              package: {
                create: {
                  packageUOM: data.Packages.Package.PackageUOM,
                  quantityOfEaches: data.Packages.Package.QuantityofEaches,
                  dimensionsHeight: data.Packages.Package.Dimensions.Height,
                  dimensionsWidth: data.Packages.Package.Dimensions.Width,
                  dimensionsLength: data.Packages.Package.Dimensions.Length,
                  packageWeight: data.Packages.Package.Weights.Weight,
                  weightUOM: data.Packages.Package.Weights.UOM,
                  maintenanceType: data.Packages.Package.MaintenanceType,
                },
              },
              pricing: {
                createMany: {
                  data: data.Prices.Pricing.map((e) => ({
                    priceSheetNumber: e.PriceSheetNumber || '',
                    currencyCode: e.CurrencyCode || '',
                    price: Number(e.Price._text) || -1,
                    priceType: e.PriceType || '',
                    maintenanceType: e.MaintenanceType || '',
                  })),
                },
              },
              digitalAssets: {
                createMany: {
                  data: data.DigitalAssets.DigitalFileInformation.map((e) => ({
                    fileName: e.FileName || '',
                    assetType: e.AssetType || '',
                    fileType: e.FileType || '',
                    uri: e.URI,
                    country: e.Country || '',
                    maintenanceType: e.MaintenanceType || '',
                  })),
                },
              },
            },
          });
        }

        return;
      },
      {
        maxWait: 3 * 60 * 1000,
        timeout: 3 * 60 * 1000, // default: 5000},
      },
    );
  }

  async handleETL(aces_path: string, pies_path: string) {
    try {
      if (!aces_path || !pies_path) {
        throw new Error('Aces & Pies paths can not be empty');
      }

      const data = await acesPiesConvertor(aces_path, pies_path);

      if (data instanceof Error)
        throw new HttpException('Supplier not found', HttpStatus.NOT_FOUND);
      // const data = await fs.readJson('mergedData.json');

      // Process in batches to avoid connection pool exhaustion
      const batchSize = 20000;
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        // Process batch with delay to allow connections to be released
        for (const item of batch) {
          this.acesClient.emit('aces_message', { data: item });
          await new Promise((resolve) => setTimeout(resolve, 10)); // 100ms delay
        }

        // Longer delay between batches
        if (i + batchSize < data.length) {
          await new Promise((resolve) => setTimeout(resolve, 50)); // 1s delay
        }
      }
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
