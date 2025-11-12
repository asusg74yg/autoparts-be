import * as fs from 'fs-extra';
import * as dotenv from 'dotenv';
import {
  CachedData,
  ProcessorResult,
  BaseVehicleData,
  EngineBaseData,
  EngineDesignationData,
  EngineVersionData,
  EngineMfrData,
  FuelTypeData,
  PartTypeData,
  BrandData,
  BaseVehicleRecord,
  ModelRecord,
  VehicleTypeRecord,
  VehicleTypeGroupRecord,
  MakeRecord,
  VehicleRecord,
  SubModelRecord,
  RegionRecord,
  EngineBaseRecord,
  EngineDesignationRecord,
  EngineVersionRecord,
  MfrRecord,
  FuelTypeRecord,
  PartRecord,
  PartsDescriptionRecord,
  CodeMasterRecord,
  CategoryRecord,
  SubCategoryRecord,
  PIESCodeRecord,
  BrandRecord,
} from './types';

dotenv.config();

// Cache for JSON files to avoid repeated file reads
const fileCache = new Map<string, CachedData>();
const cacheExpiry = 5 * 60 * 1000; // 5 minutes

// Get cached data or load from file
const getCachedData = async <T = any>(filePath: string): Promise<T> => {
  const now = Date.now();
  const cached = fileCache.get(filePath);

  if (cached && now - cached.timestamp < cacheExpiry) {
    return cached.data as T;
  }

  const data = (await fs.readJson(filePath)) as T;
  fileCache.set(filePath, {
    data,
    timestamp: now,
  });

  return data;
};

// Clear cache to free memory
export const clearCache = (): void => {
  fileCache.clear();
};

// Enhanced error handling and memory management
export const handleBaseVehicle = async (
  id: number,
): Promise<ProcessorResult<BaseVehicleData>> => {
  try {
    const payload: ProcessorResult<BaseVehicleData> = {
      type: 'BaseVehicle',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    // Use cached data loading
    const baseVehicle = await getCachedData<BaseVehicleRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/BaseVehicle.json`,
    );

    const baseVehicleRecord = baseVehicle.find(
      (vehicle) => vehicle.BaseVehicleID === id,
    );

    if (!baseVehicleRecord) {
      return payload;
    }

    payload.data.Year = baseVehicleRecord.YearID;

    // Load related data in parallel for better performance
    const [
      model,
      vehicleType,
      vehicleTypeGroup,
      make,
      vehicle,
      subModelJSON,
      region,
    ] = await Promise.all([
      getCachedData<ModelRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/model.json`,
      ),
      getCachedData<VehicleTypeRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/VehicleType.json`,
      ),
      getCachedData<VehicleTypeGroupRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/VehicleTypeGroup.json`,
      ),
      getCachedData<MakeRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/Make.json`,
      ),
      getCachedData<VehicleRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/Vehicle.json`,
      ),
      getCachedData<SubModelRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/SubModel.json`,
      ),
      getCachedData<RegionRecord[]>(
        `${process.env['BASE_PATH_FOR_VCDB']}/Region.json`,
      ),
    ]);

    // Process model data
    const modelRecord = model.find(
      (model) => baseVehicleRecord.ModelID === model.ModelID,
    );
    if (modelRecord) {
      payload.data.Model = modelRecord.ModelName;

      // Process vehicle type data
      const vehicleTypeRecord = vehicleType.find(
        (vehicleType) =>
          modelRecord.VehicleTypeID === vehicleType.VehicleTypeID,
      );
      if (vehicleTypeRecord) {
        payload.data.VehicleType = vehicleTypeRecord.VehicleTypeName;

        // Process vehicle type group data
        const vehicleTypeGroupRecord = vehicleTypeGroup.find(
          (vehicleTypeGroup) =>
            vehicleTypeRecord.VehicleTypeGroupID ===
            vehicleTypeGroup.VehicleTypeGroupID,
        );
        if (vehicleTypeGroupRecord) {
          payload.data.VehicleTypeGroup =
            vehicleTypeGroupRecord.VehicleTypeGroupName;
        }
      }
    }

    // Process make data
    const makeRecord = make.find(
      (make) => baseVehicleRecord.MakeID === make.MakeID,
    );
    if (makeRecord) {
      payload.data.Make = makeRecord.MakeName;
    }

    // Process submodel data
    const vehicleRecord = vehicle.filter(
      (vehicle) => baseVehicleRecord.BaseVehicleID === vehicle.BaseVehicleID,
    );

    const subModelRecord = vehicleRecord
      .map((vehicle) => {
        const subModels = subModelJSON
          .filter((subModel) => subModel.SubModelID === vehicle.SubmodelID)
          .flatMap((subModel) => subModel);
        const regionRecord = region.filter(
          (region) => region.RegionID === vehicle.RegionID,
        );

        return {
          subModel: subModels[0]?.SubModelName || null,
          region: regionRecord[0] || null,
        };
      })
      .filter((record) => record.subModel && record.region);

    if (subModelRecord.length > 0) {
      payload.data.SubModels = subModelRecord;
    }

    // Validate required fields
    const requiredKeys: (keyof BaseVehicleData)[] = [
      'SubModels',
      'Make',
      'Year',
      'Model',
      'VehicleType',
      'VehicleTypeGroup',
    ];
    const hasAllKeys = requiredKeys.every(
      (key) =>
        payload.data[key] &&
        (Array.isArray(payload.data[key])
          ? (payload.data[key] as any[]).length > 0
          : true),
    );

    payload.success = hasAllKeys;
    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handleBaseVehicle for ID ${id}:`, errorMessage);
    return {
      type: 'BaseVehicle',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handleEngineBase = async (
  id: number,
): Promise<ProcessorResult<EngineBaseData>> => {
  try {
    const payload: ProcessorResult<EngineBaseData> = {
      type: 'EngineBase',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    const engineBase = await getCachedData<EngineBaseRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/EngineBase.json`,
    );

    const engineBaseRecord = engineBase.find(
      (engineBase) => engineBase.EngineBaseID === id,
    );

    if (engineBaseRecord) {
      payload.data.EngineBase = engineBaseRecord;
      payload.success = true;
    }

    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handleEngineBase for ID ${id}:`, errorMessage);
    return {
      type: 'EngineBase',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handleEngineDesignation = async (
  id: number,
): Promise<ProcessorResult<EngineDesignationData>> => {
  try {
    const payload: ProcessorResult<EngineDesignationData> = {
      type: 'EngineDesignation',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    const engineDesignation = await getCachedData<EngineDesignationRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/EngineDesignation.json`,
    );

    const engineDesignationRecord = engineDesignation.find(
      (engineDesignation) => engineDesignation.EngineDesignationID === id,
    );

    if (engineDesignationRecord) {
      payload.data.EngineDesignation =
        engineDesignationRecord.EngineDesignationName;
      payload.success = true;
    }

    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `Error in handleEngineDesignation for ID ${id}:`,
      errorMessage,
    );
    return {
      type: 'EngineDesignation',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handleEngineVersion = async (
  id: number,
): Promise<ProcessorResult<EngineVersionData>> => {
  try {
    const payload: ProcessorResult<EngineVersionData> = {
      type: 'EngineVersion',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    const engineVersion = await getCachedData<EngineVersionRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/EngineVersion.json`,
    );

    const engineVersionRecord = engineVersion.find(
      (engineVersion) => engineVersion.EngineVersionID === id,
    );

    if (engineVersionRecord) {
      payload.data.EngineVersion = engineVersionRecord.EngineVersion;
      payload.success = true;
    }

    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handleEngineVersion for ID ${id}:`, errorMessage);
    return {
      type: 'EngineVersion',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handleEngineMfr = async (
  id: number,
): Promise<ProcessorResult<EngineMfrData>> => {
  try {
    const payload: ProcessorResult<EngineMfrData> = {
      type: 'EngineMfr',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    const engineMfr = await getCachedData<MfrRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/Mfr.json`,
    );

    const engineMfrRecord = engineMfr.find(
      (engineMfr) => engineMfr.MfrID === id,
    );

    if (engineMfrRecord) {
      payload.data.EngineMfr = engineMfrRecord.MfrName;
      payload.success = true;
    }

    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handleEngineMfr for ID ${id}:`, errorMessage);
    return {
      type: 'EngineMfr',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handleFuelType = async (
  id: number,
): Promise<ProcessorResult<FuelTypeData>> => {
  try {
    const payload: ProcessorResult<FuelTypeData> = {
      type: 'FuelType',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    const fuelType = await getCachedData<FuelTypeRecord[]>(
      `${process.env['BASE_PATH_FOR_VCDB']}/FuelType.json`,
    );

    const fuelTypeRecord = fuelType.find(
      (fuelType) => fuelType.FuelTypeID === id,
    );

    if (fuelTypeRecord) {
      payload.data.FuelType = fuelTypeRecord.FuelTypeName;
      payload.success = true;
    }

    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handleFuelType for ID ${id}:`, errorMessage);
    return {
      type: 'FuelType',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handlePartType = async (
  id: number,
): Promise<ProcessorResult<PartTypeData>> => {
  try {
    const payload: ProcessorResult<PartTypeData> = {
      type: 'PartType',
      success: false,
      id: id,
      data: {},
    };

    if (!id) {
      return payload;
    }

    // Load all required data in parallel
    const [partType, partTypeDescription, codeMaster, category, subcategory] =
      await Promise.all([
        getCachedData<PartRecord[]>(
          `${process.env['BASE_PATH_FOR_PCDB']}/parts.json`,
        ),
        getCachedData<PartsDescriptionRecord[]>(
          `${process.env['BASE_PATH_FOR_PCDB']}/PartsDescription.json`,
        ),
        getCachedData<CodeMasterRecord[]>(
          `${process.env['BASE_PATH_FOR_PCDB']}/CodeMaster.json`,
        ),
        getCachedData<CategoryRecord[]>(
          `${process.env['BASE_PATH_FOR_PCDB']}/Categories.json`,
        ),
        getCachedData<SubCategoryRecord[]>(
          `${process.env['BASE_PATH_FOR_PCDB']}/Subcategories.json`,
        ),
      ]);

    const partTypeRecord = partType.find(
      (partType) => partType.PartTerminologyID === id,
    );

    if (!partTypeRecord) {
      return payload;
    }

    payload.data.PartTypeName = partTypeRecord.PartTerminologyName;

    // Process part type description
    const partTypeDescriptionRecord = partTypeDescription.find(
      (partTypeDescription) =>
        partTypeDescription.PartsDescriptionID ===
        partTypeRecord.PartsDescriptionId,
    );

    if (partTypeDescriptionRecord) {
      payload.data.PartTypeDescription =
        partTypeDescriptionRecord.PartsDescription;
    }

    // Process category and subcategory
    const codeMasterRecord = codeMaster
      .filter(
        (codeMaster) =>
          codeMaster.PartTerminologyID === partTypeRecord.PartTerminologyID,
      )
      .map((codeMaster) => {
        const categoryRecord = category.find(
          (category) => category.CategoryID === codeMaster.CategoryID,
        );
        const subcategoryRecord = subcategory.find(
          (subcategory) =>
            subcategory.SubCategoryID === codeMaster.SubCategoryID,
        );

        return {
          category: categoryRecord?.CategoryName || null,
          subcategory: subcategoryRecord?.SubCategoryName || null,
        };
      })
      .filter((record) => record.category && record.subcategory);

    if (codeMasterRecord.length > 0) {
      const record = codeMasterRecord[0];
      if (record?.category) {
        payload.data.Category = record.category;
      }
      if (record?.subcategory) {
        payload.data.Subcategory = record.subcategory;
      }
    }

    // Validate required fields
    const requiredKeys: (keyof PartTypeData)[] = [
      'PartTypeName',
      'PartTypeDescription',
      'Category',
      'Subcategory',
    ];
    const hasAllKeys = requiredKeys.every((key) => payload.data[key]);

    payload.success = hasAllKeys;
    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handlePartType for ID ${id}:`, errorMessage);
    return {
      type: 'PartType',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};

export const handlePIESCode = async (
  code: string,
): Promise<string | ProcessorResult> => {
  try {
    const payload: ProcessorResult = {
      type: 'PIESCode',
      success: false,
      code: code,
      data: {},
    };

    if (!code) {
      return payload;
    }

    const piesCode = await getCachedData<PIESCodeRecord[]>(
      `${process.env['BASE_PATH_FOR_PCDB']}/PIESCode.json`,
    );

    const piesCodeRecord = piesCode.find(
      (piesCode) => piesCode.CodeValue === code,
    );

    if (piesCodeRecord) {
      payload.data.PIESCodeDescription = piesCodeRecord.CodeDescription;
      payload.data.PIESCode = piesCodeRecord.CodeValue;
      payload.success = true;
    }

    return payload.data.PIESCodeDescription || '';
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in handlePIESCode for code ${code}:`, errorMessage);
    return {
      type: 'PIESCode',
      success: false,
      code: code,
      data: {},
      error: errorMessage,
    };
  }
};

export const handlePIESExpiCode = async (
  code: string,
): Promise<ProcessorResult> => {
  const payload: ProcessorResult = {
    type: 'PIESExpiCode',
    success: false,
    code: code,
    data: {},
  };

  try {
    const piesExpiCode = await getCachedData(
      `${process.env['BASE_PATH_FOR_PCDB']}/PIESExpiCode.json`,
    );
    const piesExpiCodeRecord = piesExpiCode.find(
      (piesExpiCode: any) => piesExpiCode.ExpiCode === code,
    );
    if (piesExpiCodeRecord) {
      payload.data.PIESExpiCodeDescription =
        piesExpiCodeRecord.ExpiCodeDescription;
      payload.data.PIESExpiCode = piesExpiCodeRecord.ExpiCode;
    }

    const piesExpiGroup = await getCachedData(
      `${process.env['BASE_PATH_FOR_PCDB']}/PIESExpiGroup.json`,
    );
    const piesExpiGroupRecord = piesExpiGroup.find(
      (piesExpiGroup: any) =>
        piesExpiGroup.PIESExpiGroupId === piesExpiCodeRecord.PIESExpiGroupId,
    );
    if (piesExpiGroupRecord) {
      payload.data.PIESExpiGroupDescription =
        piesExpiGroupRecord.ExpiGroupDescription;
      payload.data.PIESExpiGroup = piesExpiGroupRecord.ExpiGroupCode;
    }

    const keys = Object.keys(payload.data);
    const isOk =
      keys.includes('PIESExpiCodeDescription') &&
      keys.includes('PIESExpiCode') &&
      keys.includes('PIESExpiGroupDescription') &&
      keys.includes('PIESExpiGroup');
    if (isOk) {
      payload.success = true;
    } else {
      payload.success = false;
    }
    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    payload.error = errorMessage;
    return payload;
  }
};

export const handleVerifyBrand = async (
  id: string,
): Promise<ProcessorResult<BrandData>> => {
  try {
    const payload: ProcessorResult<BrandData> = {
      type: 'Brand',
      success: false,
      id: id,
      data: {},
    };

    const veriBrand = await getCachedData<BrandRecord[]>(
      `${process.env['BASE_PATH_FOR_BRAND']}/AutoCare_BrandTable.json`,
    );
    const veriBrandRecord = veriBrand.find(
      (veriBrand) => veriBrand.BrandID === id,
    );

    if (veriBrandRecord) {
      payload.data = veriBrandRecord;
    }
    const keys = Object.keys(payload.data);
    const isOk = keys.includes('BrandID');
    if (isOk) {
      payload.success = true;
    } else {
      payload.success = false;
    }
    return payload;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return {
      type: 'Brand',
      success: false,
      id: id,
      data: {},
      error: errorMessage,
    };
  }
};
