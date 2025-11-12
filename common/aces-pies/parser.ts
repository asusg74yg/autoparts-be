import { XMLParser } from 'fast-xml-parser';
import * as fs from 'fs-extra';
import { ParseResult, ACESData, PIESData } from './types';

/**
 * Parse ACES XML file into JSON format
 */
export async function parseACESXML(
  filePath: string,
): Promise<ParseResult<ACESData>> {
  try {
    console.log(`📋 Parsing ACES XML file: ${filePath}`);

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
      };
    }

    // Read XML content
    const xmlContent = await fs.readFile(filePath, 'utf-8');

    // Configure XML parser for ACES format
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      allowBooleanAttributes: true,
    });

    // Parse XML to JSON
    const result = parser.parse(xmlContent) as ACESData;

    // Validate ACES structure
    if (!result.ACES || !result.ACES.App || !Array.isArray(result.ACES.App)) {
      return {
        success: false,
        error: 'Invalid ACES XML structure: missing ACES.App array',
      };
    }

    const recordCount = result.ACES.App.length;
    console.log(
      `✅ Successfully parsed ACES XML with ${recordCount} applications`,
    );

    return {
      success: true,
      data: result,
      recordCount,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error parsing ACES XML file: ${errorMessage}`);
    return {
      success: false,
      error: `Parsing error: ${errorMessage}`,
    };
  }
}

/**
 * Parse PIES XML file into JSON format
 */
export async function parsePIESXML(
  filePath: string,
): Promise<ParseResult<PIESData>> {
  try {
    console.log(`📋 Parsing PIES XML file: ${filePath}`);

    // Check if file exists
    if (!(await fs.pathExists(filePath))) {
      return {
        success: false,
        error: `File not found: ${filePath}`,
      };
    }

    // Read XML content
    const xmlContent = await fs.readFile(filePath, 'utf-8');

    // Configure XML parser for PIES format
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '_text',
      parseAttributeValue: true,
      parseTagValue: true,
      trimValues: true,
      allowBooleanAttributes: true,
    });

    // Parse XML to JSON
    const result = parser.parse(xmlContent) as PIESData;

    // Validate PIES structure
    if (
      !result.PIES ||
      !result.PIES.Items ||
      !result.PIES.Items.Item ||
      !Array.isArray(result.PIES.Items.Item)
    ) {
      return {
        success: false,
        error: 'Invalid PIES XML structure: missing PIES.Items.Item array',
      };
    }

    const recordCount = result.PIES.Items.Item.length;
    console.log(`✅ Successfully parsed PIES XML with ${recordCount} items`);

    return {
      success: true,
      data: result,
      recordCount,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error parsing PIES XML file: ${errorMessage}`);
    return {
      success: false,
      error: `Parsing error: ${errorMessage}`,
    };
  }
}

/**
 * Parse both ACES and PIES XML files
 */
export async function parseBothXMLFiles(
  acesPath: string,
  piesPath: string,
): Promise<{
  aces: ParseResult<ACESData>;
  pies: ParseResult<PIESData>;
}> {
  console.log('🚀 Starting ACES & PIES XML parsing...\n');

  // Parse both files in parallel
  const [acesResult, piesResult] = await Promise.all([
    parseACESXML(acesPath),
    parsePIESXML(piesPath),
  ]);

  // Summary
  console.log('\n📊 Parsing Summary:');
  console.log(
    `ACES: ${acesResult.success ? '✅ Success' : '❌ Failed'} - ${acesResult.recordCount || 0} records`,
  );
  console.log(
    `PIES: ${piesResult.success ? '✅ Success' : '❌ Failed'} - ${piesResult.recordCount || 0} records`,
  );

  if (acesResult.success && piesResult.success) {
    console.log('\n🎉 Both files parsed successfully!');
  } else {
    console.log('\n⚠️  Some files failed to parse. Check errors above.');
  }

  return { aces: acesResult, pies: piesResult };
}

/**
 * Save parsed data to JSON files
 */
export async function saveParsedData(
  acesData: ACESData,
  piesData: PIESData,
  outputDir: string,
): Promise<void> {
  try {
    console.log(`\n💾 Saving parsed data to: ${outputDir}`);

    // Ensure output directory exists
    await fs.ensureDir(outputDir);

    // Save ACES data
    const acesOutputPath = `${outputDir}/aces-parsed.json`;
    await fs.writeJson(acesOutputPath, acesData, { spaces: 2 });
    console.log(`✅ ACES data saved to: ${acesOutputPath}`);

    // Save PIES data
    const piesOutputPath = `${outputDir}/pies-parsed.json`;
    await fs.writeJson(piesOutputPath, piesData, { spaces: 2 });
    console.log(`✅ PIES data saved to: ${piesOutputPath}`);

    console.log('\n🎯 Parsing and saving completed successfully!');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.error(`❌ Error saving parsed data: ${errorMessage}`);
    throw error;
  }
}
