import { Config } from './types';

// Configuration file for ACES & PIES processor
const config: Config = {
  // Memory management settings
  memory: {
    // Chunk size for processing (smaller = less memory, slower processing)
    chunkSize: 50,

    // Delay between chunks in milliseconds (prevents overwhelming the system)
    chunkDelay: 100,

    // Cache settings
    cache: {
      // File cache TTL in milliseconds (5 minutes)
      ttl: 5 * 60 * 1000,

      // Maximum cache size (number of files)
      maxSize: 100,
    },

    // Garbage collection settings
    gc: {
      // Enable garbage collection hints (requires --expose-gc flag)
      enabled: false,

      // Force GC after every N chunks
      frequency: 5,
    },
  },

  // Processing settings
  processing: {
    // Enable memory monitoring
    enableMemoryMonitoring: true,

    // Memory checkpoint frequency (every N chunks)
    memoryCheckpointFrequency: 5,

    // Enable parallel processing for data fetching
    enableParallelProcessing: true,

    // Maximum concurrent operations
    maxConcurrency: 10,
  },

  // File paths
  paths: {
    // Input XML files
    aces: './aces-pies-xml/aces.xml',
    pies: './aces-pies-xml/pies.xml',

    // Output directory
    output: './output',

    // Reference data directories
    vcdb:
      process.env['BASE_PATH_FOR_VCDB'] ||
      './autocare.org/AutoCare_VCdb_NA_LDPS_enUS_JSON_20250828',
    pcdb:
      process.env['BASE_PATH_FOR_PCDB'] ||
      './autocare.org/AutoCare_PCdb_enUS_JSON_20250828',
    brand: process.env['BASE_PATH_FOR_BRAND'] || './autocare.org',
  },

  // Logging settings
  logging: {
    // Enable detailed logging
    verbose: true,

    // Log memory usage
    logMemory: true,

    // Log processing progress
    logProgress: true,

    // Log errors
    logErrors: true,
  },

  // Performance tuning
  performance: {
    // Enable performance optimizations
    enabled: true,

    // Use Map for lookups instead of array searches
    useMapLookups: true,

    // Batch size for file operations
    batchSize: 1000,

    // Enable streaming for large files
    enableStreaming: false,
  },
};

export default config;
