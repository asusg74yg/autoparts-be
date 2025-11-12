import { parseBothXMLFiles } from './parser';
import {
  handleBaseVehicle,
  handleEngineBase,
  handleEngineDesignation,
  handleEngineVersion,
  handleVerifyBrand,
  handleEngineMfr,
  handleFuelType,
  handlePartType,
  handlePIESCode,
  clearCache,
} from './processors';
import * as fs from 'fs-extra';
import { MemoryMonitor } from './memory-monitor';
import config from './config';
import { PrismaClient } from '@prisma/client';
import { ACESApplication, PIESItem, ProcessedItem } from './types';

const db = new PrismaClient();
// Process data in chunks to avoid memory leaks
const processDataInChunks = (
  data: ACESApplication[],
  chunkSize: number = config.memory.chunkSize,
): ACESApplication[][] => {
  const chunks: ACESApplication[][] = [];
  for (let i = 0; i < data.length; i += chunkSize) {
    chunks.push(data.slice(i, i + chunkSize));
  }
  return chunks;
};

// Enhanced data fetching with proper error handling
const fetchData = async (
  item: ACESApplication & PIESItem,
): Promise<ProcessedItem | null> => {
  try {
    if (!item || !item.BaseVehicle || !item.EngineBase) {
      return null;
    }

    const [
      baseVehicle,
      engineBase,
      engineDesignation,
      engineVersion,
      engineMfr,
      fuelType,
      partType,
      brand,
    ] = await Promise.all([
      handleBaseVehicle(item.BaseVehicle.id),
      handleEngineBase(item.EngineBase.id),
      handleEngineDesignation(item.EngineDesignation?.id || 0),
      handleEngineVersion(item.EngineVersion?.id || 0),
      handleEngineMfr(item.EngineMfr?.id || 0),
      handleFuelType(item.FuelType?.id || 0),
      handlePartType(item.PartType?.id || 0),
      handleVerifyBrand(item.BrandAAIAID || ''),
    ]);

    if (item.BrandAAIAID) {
      item.BrandAAIAID = (await handleVerifyBrand(item.BrandAAIAID)) as any;
    }
    if (item.HazardousMaterialCode) {
      item.HazardousMaterialCode = (await handlePIESCode(
        item.HazardousMaterialCode,
      )) as string;
    }
    if (item.ACESApplications) {
      item.ACESApplications = (await handlePIESCode(
        item.ACESApplications,
      )) as string;
    }

    if (item.ItemQuantitySize) {
      item.ItemQuantitySize.UOM = (await handlePIESCode(
        item.ItemQuantitySize.UOM,
      )) as string;
    }
    if (item.ContainerType) {
      item.ContainerType = (await handlePIESCode(item.ContainerType)) as string;
    }
    if (item.QuantityPerApplication) {
      item.QuantityPerApplication.Qualifier = (await handlePIESCode(
        item.QuantityPerApplication.Qualifier,
      )) as string;
      item.QuantityPerApplication.UOM = (await handlePIESCode(
        item.QuantityPerApplication.UOM,
      )) as string;
    }
    if (item.MinimumOrderQuantity) {
      item.MinimumOrderQuantity.UOM = (await handlePIESCode(
        item.MinimumOrderQuantity.UOM,
      )) as string;
    }

    if (item.Prices) {
      item.Prices = {
        Pricing: await Promise.all(
          item.Prices.Pricing.map(async (price) => {
            const payload = { ...price };
            payload.PriceType = (await handlePIESCode(
              payload.PriceType,
            )) as string;
            payload.Price['UOM'] = (await handlePIESCode(
              payload.Price.UOM,
            )) as string;
            return payload;
          }),
        ),
      };
    }
    if (item.Descriptions) {
      item.Descriptions = {
        Description: await Promise.all(
          item.Descriptions.Description.map(async (description) => {
            const payload = { ...description };
            payload.LanguageCode = (await handlePIESCode(
              payload.LanguageCode,
            )) as string;
            payload.DescriptionCode = (await handlePIESCode(
              payload.DescriptionCode,
            )) as string;
            return payload;
          }),
        ),
      };
    }

    if (
      brand.success &&
      baseVehicle.success &&
      engineBase.success &&
      engineDesignation.success &&
      engineVersion.success &&
      engineMfr.success &&
      fuelType.success &&
      partType.success
    ) {
      return {
        ...item,
        BaseVehicle: baseVehicle,
        EngineBase: engineBase,
        EngineDesignation: engineDesignation,
        EngineVersion: engineVersion,
        EngineMfr: engineMfr,
        FuelType: fuelType,
        PartType: partType,
        BrandAAIAID: brand,
      };
    } else {
      return null;
    }
  } catch (error) {
    if (config.logging.logErrors) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `Error processing item ${item?.Part || 'unknown'}:`,
        errorMessage,
      );
    }
    return null;
  }
};

export const acesPiesConvertor = async (
  acesP: string,
  piesP: string,
): Promise<any> => {
  // Initialize memory monitor if enabled
  let memoryMonitor: MemoryMonitor | null = null;
  if (config.processing.enableMemoryMonitoring) {
    memoryMonitor = new MemoryMonitor();
  }
  if (!acesP || !piesP) {
    throw new Error('ACES and PIES paths are required');
  }
  try {
    const acesPath = acesP;
    const piesPath = piesP;
    // const outputDir = config.paths.output;

    console.log('🚀 Starting ACES & PIES processing...');
    if (memoryMonitor) memoryMonitor.checkpoint('Start');

    // Parse XML files
    const { aces, pies } = await parseBothXMLFiles(acesPath, piesPath);
    try {
      const supplier = await db.supplier.findFirst({
        where: {
          brandLabel: {
            contains: pies.data?.PIES.Items.Item[0].BrandLabel,
          },
        },
      });
      if (!supplier) throw new Error('Supplier not found');
    } catch (error) {
      if (error) {
        return new Error(error.message);
      }
    }
    if (memoryMonitor) memoryMonitor.checkpoint('After parsing XML files');

    if (!aces.success || !pies.success) {
      throw new Error('Failed to parse one or more XML files');
    }

    if (config.logging.logProgress) {
      console.log(
        `📊 Processing ${aces.recordCount} ACES records and ${pies.recordCount} PIES records...`,
      );
    }

    // Create a Map for faster PIES lookup
    const piesMap = new Map<string, PIESItem>();
    pies.data!.PIES.Items.Item.forEach((item) => {
      piesMap.set(item.PartNumber, item);
    });
    if (memoryMonitor)
      memoryMonitor.checkpoint('After creating PIES lookup map');

    // Process data in chunks to manage memory
    const chunkSize = config.memory.chunkSize;
    const acesData = aces.data!.ACES.App;
    const chunks = processDataInChunks(acesData, chunkSize);

    const processedData: ProcessedItem[] = [];

    for (let i = 0; i < chunks.length; i++) {
      if (config.logging.logProgress) {
        console.log(
          `🔄 Processing chunk ${i + 1}/${chunks.length} (${
            chunks[i]?.length || 0
          } items)`,
        );
      }

      const chunkResults = await Promise.all(
        (chunks[i] || []).map(async (ace) => {
          const pie = piesMap.get(ace.Part);
          if (!pie) return null;

          const mergedItem = { ...ace, ...pie };
          return await fetchData(mergedItem);
        }),
      );

      // Filter out null results and add to processed data
      const validResults = chunkResults.filter(
        (item): item is ProcessedItem => item !== null,
      );
      processedData.push(...validResults);

      // Clear chunk results to free memory
      chunkResults.length = 0;

      // Log memory usage based on configuration
      if (
        (memoryMonitor &&
          (i + 1) % config.processing.memoryCheckpointFrequency === 0) ||
        i === chunks.length - 1
      ) {
        memoryMonitor?.checkpoint(`After processing chunk ${i + 1}`);
      }

      // Force garbage collection hint if enabled
      if (
        config.memory.gc.enabled &&
        global.gc &&
        (i + 1) % config.memory.gc.frequency === 0
      ) {
        global.gc();
      }

      // Delay between chunks to prevent overwhelming the system
      await new Promise((resolve) =>
        setTimeout(resolve, config.memory.chunkDelay),
      );
    }

    if (config.logging.logProgress) {
      console.log(`✅ Successfully processed ${processedData.length} items`);
    }
    if (memoryMonitor) memoryMonitor.checkpoint('After processing all chunks');

    // Save processed data
    await fs.writeJson('mergedData.json', processedData, { spaces: 2 });
    if (config.logging.logProgress) {
      console.log('💾 Data saved to mergedData.json');
    }
    if (memoryMonitor) memoryMonitor.checkpoint('After saving data');

    // Clean up references to free memory
    piesMap.clear();
    clearCache(); // Clear the file cache

    // Clear processed data array
    processedData.length = 0;

    if (memoryMonitor) {
      memoryMonitor.checkpoint('After cleanup');
      memoryMonitor.logSummary();
    }
    const mergedData = await fs.readJson('mergedData.json');
    console.log('🎉 Processing completed successfully!');
    return mergedData;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error in main process:', errorMessage);
    if (memoryMonitor) {
      memoryMonitor.checkpoint('Error occurred');
      memoryMonitor.logSummary();
    }
    // Clean up on error
    clearCache();
    process.exit(1);
  }
};

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Process interrupted by user');
  clearCache(); // Clear cache before exit
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Process terminated');
  clearCache(); // Clear cache before exit
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  clearCache(); // Clear cache before exit
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  clearCache(); // Clear cache before exit
  process.exit(1);
});
