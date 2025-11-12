// Type definitions for ACES & PIES processing system

export interface Config {
  memory: {
    chunkSize: number;
    chunkDelay: number;
    cache: {
      ttl: number;
      maxSize: number;
    };
    gc: {
      enabled: boolean;
      frequency: number;
    };
  };
  processing: {
    enableMemoryMonitoring: boolean;
    memoryCheckpointFrequency: number;
    enableParallelProcessing: boolean;
    maxConcurrency: number;
  };
  paths: {
    aces: string;
    pies: string;
    output: string;
    vcdb: string;
    pcdb: string;
    brand: string;
  };
  logging: {
    verbose: boolean;
    logMemory: boolean;
    logProgress: boolean;
    logErrors: boolean;
  };
  performance: {
    enabled: boolean;
    useMapLookups: boolean;
    batchSize: number;
    enableStreaming: boolean;
  };
}

export interface ParseResult<T = any> {
  success: boolean;
  data?: T;
  recordCount?: number;
  error?: string;
}

export interface ACESData {
  ACES: {
    App: ACESApplication[];
  };
}

export interface PIESData {
  PIES: {
    Items: {
      Item: PIESItem[];
    };
  };
}

export interface ACESApplication {
  Part: string;
  BaseVehicle: {
    id: number;
  };
  EngineBase: {
    id: number;
  };
  EngineDesignation?: {
    id: number;
  };
  EngineVersion?: {
    id: number;
  };
  EngineMfr?: {
    id: number;
  };
  FuelType?: {
    id: number;
  };
  PartType?: {
    id: number;
  };
  BrandAAIAID?: string;
  HazardousMaterialCode?: string;
  ACESApplications?: string;
  ItemQuantitySize?: {
    UOM: string;
  };
  ContainerType?: string;
  QuantityPerApplication?: {
    Qualifier: string;
    UOM: string;
  };
  MinimumOrderQuantity?: {
    UOM: string;
  };
  Prices?: {
    Pricing: PricingItem[];
  };
  Descriptions?: {
    Description: DescriptionItem[];
  };
}

export interface PIESItem {
  PartNumber: string;
  [key: string]: any;
}

export interface PricingItem {
  PriceType: string;
  Price: {
    UOM: string;
  };
  [key: string]: any;
}

export interface DescriptionItem {
  LanguageCode: string;
  DescriptionCode: string;
  [key: string]: any;
}

export interface ProcessedItem extends Omit<ACESApplication, 'BaseVehicle' | 'EngineBase' | 'EngineDesignation' | 'EngineVersion' | 'EngineMfr' | 'FuelType' | 'PartType' | 'BrandAAIAID'>, PIESItem {
  BaseVehicle: ProcessorResult<BaseVehicleData>;
  EngineBase: ProcessorResult<EngineBaseData>;
  EngineDesignation: ProcessorResult<EngineDesignationData>;
  EngineVersion: ProcessorResult<EngineVersionData>;
  EngineMfr: ProcessorResult<EngineMfrData>;
  FuelType: ProcessorResult<FuelTypeData>;
  PartType: ProcessorResult<PartTypeData>;
  BrandAAIAID: ProcessorResult<BrandData>;
}

export interface ProcessorResult<T = any> {
  type: string;
  success: boolean;
  id?: number | string;
  code?: string;
  data: T;
  error?: string;
}

export interface BaseVehicleData {
  Year?: number;
  Model?: string;
  VehicleType?: string;
  VehicleTypeGroup?: string;
  Make?: string;
  SubModels?: SubModelData[];
}

export interface SubModelData {
  subModel: string | null;
  region: any;
}

export interface EngineBaseData {
  EngineBase?: any;
}

export interface EngineDesignationData {
  EngineDesignation?: string;
}

export interface EngineVersionData {
  EngineVersion?: string;
}

export interface EngineMfrData {
  EngineMfr?: string;
}

export interface FuelTypeData {
  FuelType?: string;
}

export interface PartTypeData {
  PartTypeName?: string;
  PartTypeDescription?: string;
  Category?: string;
  Subcategory?: string;
}

export interface BrandData {
  BrandID?: string;
  [key: string]: any;
}

export interface MemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

export interface MemoryCheckpoint {
  label: string;
  timestamp: number;
  memory: MemoryUsage;
}

export interface MemorySummary {
  elapsed: number;
  startMemory: MemoryUsage;
  currentMemory: MemoryUsage;
  peakMemory: MemoryUsage;
  checkpoints: MemoryCheckpoint[];
}

export interface CachedData<T = any> {
  data: T;
  timestamp: number;
}

// AutoCare database types
export interface BaseVehicleRecord {
  BaseVehicleID: number;
  YearID: number;
  ModelID: number;
  MakeID: number;
}

export interface ModelRecord {
  ModelID: number;
  ModelName: string;
  VehicleTypeID: number;
}

export interface VehicleTypeRecord {
  VehicleTypeID: number;
  VehicleTypeName: string;
  VehicleTypeGroupID: number;
}

export interface VehicleTypeGroupRecord {
  VehicleTypeGroupID: number;
  VehicleTypeGroupName: string;
}

export interface MakeRecord {
  MakeID: number;
  MakeName: string;
}

export interface VehicleRecord {
  BaseVehicleID: number;
  SubmodelID: number;
  RegionID: number;
}

export interface SubModelRecord {
  SubModelID: number;
  SubModelName: string;
}

export interface RegionRecord {
  RegionID: number;
  [key: string]: any;
}

export interface EngineBaseRecord {
  EngineBaseID: number;
  [key: string]: any;
}

export interface EngineDesignationRecord {
  EngineDesignationID: number;
  EngineDesignationName: string;
}

export interface EngineVersionRecord {
  EngineVersionID: number;
  EngineVersion: string;
}

export interface MfrRecord {
  MfrID: number;
  MfrName: string;
}

export interface FuelTypeRecord {
  FuelTypeID: number;
  FuelTypeName: string;
}

export interface PartRecord {
  PartTerminologyID: number;
  PartTerminologyName: string;
  PartsDescriptionId: number;
}

export interface PartsDescriptionRecord {
  PartsDescriptionID: number;
  PartsDescription: string;
}

export interface CodeMasterRecord {
  PartTerminologyID: number;
  CategoryID: number;
  SubCategoryID: number;
}

export interface CategoryRecord {
  CategoryID: number;
  CategoryName: string;
}

export interface SubCategoryRecord {
  SubCategoryID: number;
  SubCategoryName: string;
}

export interface PIESCodeRecord {
  CodeValue: string;
  CodeDescription: string;
}

export interface BrandRecord {
  BrandID: string;
  [key: string]: any;
}
