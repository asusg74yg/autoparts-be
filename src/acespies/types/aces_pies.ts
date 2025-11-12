// ------------------- Base Types -------------------
interface Region {
  RegionID: number;
  ParentID: number | null;
  RegionAbbr: string;
  RegionName: string;
}

interface SubModel {
  subModel: string;
  region: Region;
}

interface BaseVehicleData {
  Year: number;
  Model: string;
  VehicleType: string;
  VehicleTypeGroup: string;
  Make: string;
  SubModels: SubModel[];
}

interface BaseVehicle {
  type: 'BaseVehicle';
  success: boolean;
  id: number;
  data: BaseVehicleData;
}

// ------------------- Engine -------------------
interface EngineBaseData {
  EngineBaseID: number;
  Liter: string;
  CC: string;
  CID: string;
  Cylinders: string;
  BlockType: string;
  EngBoreIn: string;
  EngBoreMetric: string;
  EngStrokeIn: string;
  EngStrokeMetric: string;
}

interface EngineBase {
  type: 'EngineBase';
  success: boolean;
  id: number;
  data: { EngineBase: EngineBaseData };
}

interface EngineDesignation {
  type: 'EngineDesignation';
  success: boolean;
  id: number;
  data: { EngineDesignation: string };
}

interface EngineVersion {
  type: 'EngineVersion';
  success: boolean;
  id: number;
  data: { EngineVersion: string };
}

interface EngineMfr {
  type: 'EngineMfr';
  success: boolean;
  id: number;
  data: { EngineMfr: string };
}

interface FuelType {
  type: 'FuelType';
  success: boolean;
  id: number;
  data: { FuelType: string };
}

// ------------------- Part Type -------------------
interface PartTypeData {
  PartTypeName: string;
  PartTypeDescription: string;
  Category: string;
  Subcategory: string;
}

interface PartType {
  type: 'PartType';
  success: boolean;
  id: number;
  data: PartTypeData;
}

// ------------------- Brand -------------------
interface BrandData {
  ParentID: string;
  ParentCompany: string;
  BrandID: string;
  BrandName: string;
  SubBrandID: string | null;
  SubBrand: string | null;
  BrandOEMFlag: boolean;
  'Revision Date': string;
}

interface BrandAAIAID {
  type: 'Brand';
  success: boolean;
  id: string;
  data: BrandData;
}

// ------------------- Descriptions -------------------
interface Description {
  _text: string;
  MaintenanceType: string;
  LanguageCode: string;
  DescriptionCode: string;
  Sequence?: number;
}

interface Descriptions {
  Description: Description[];
}

// ------------------- Prices -------------------
interface PriceValue {
  _text: number;
  UOM: string;
}

interface Pricing {
  PriceSheetNumber: string;
  CurrencyCode: string;
  Price: PriceValue;
  MaintenanceType: string;
  PriceType: string;
}

interface Prices {
  Pricing: Pricing[];
}

// ------------------- Extended Info -------------------
interface ExtendedProductInfo {
  _text: string | number;
  MaintenanceType: string;
  EXPICode: string;
  LanguageCode: string;
}

interface ExtendedInformation {
  ExtendedProductInformation: ExtendedProductInfo[];
}

// ------------------- Product Attributes -------------------
interface ProductAttribute {
  _text: string;
  MaintenanceType: string;
  AttributeID: string;
  PADBAttribute: string;
  RecordNumber: number;
  MultiValueQuantity: number;
  MultiValueSequence: number;
  LanguageCode: string;
}

interface ProductAttributes {
  ProductAttribute: ProductAttribute[];
}

// ------------------- Packages -------------------
interface Dimensions {
  Height: number;
  Width: number;
  Length: number;
  UOM: string;
}

interface Weights {
  Weight: number;
  UOM: string;
}

interface Package {
  PackageUOM: string;
  QuantityofEaches: number;
  Dimensions: Dimensions;
  Weights: Weights;
  MaintenanceType: string;
}

interface Packages {
  Package: Package;
}

// ------------------- Digital Assets -------------------
interface DigitalFileInformation {
  FileName: string;
  AssetType: string;
  FileType?: string;
  URI: string;
  Country: string;
  MaintenanceType: string;
}

interface DigitalAssets {
  DigitalFileInformation: DigitalFileInformation[];
}

// ------------------- Root Product -------------------
export interface Product {
  BaseVehicle: BaseVehicle;
  EngineBase: EngineBase;
  EngineDesignation: EngineDesignation;
  EngineVersion: EngineVersion;
  EngineMfr: EngineMfr;
  FuelType: FuelType;
  Qty: number;
  PartType: PartType;
  MfrLabel: string;
  Part: string;
  action: string;
  id: number;
  HazardousMaterialCode: string;
  PartNumber: string;
  BrandAAIAID: BrandAAIAID;
  BrandLabel: string;
  ACESApplications: string;
  ItemQuantitySize: { _text: number; UOM: string };
  ContainerType: string;
  QuantityPerApplication: { _text: number; Qualifier: string; UOM: string };
  MinimumOrderQuantity: { _text: number; UOM: string };
  PartTerminologyID: number;
  Descriptions: Descriptions;
  Prices: Prices;
  ExtendedInformation: ExtendedInformation;
  ProductAttributes: ProductAttributes;
  Packages: Packages;
  DigitalAssets: DigitalAssets;
  MaintenanceType: string;
}
