import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import type {
  DecodersData,
  DecoderInfo,
  DecoderMethodInfo,
  SourceLocation,
} from './types.js';

// Import the Python data by executing the Python script and parsing the output
function importPythonData(): any {
  const pythonScript = `
import sys
import json
sys.path.append('${resolve('../docs')}')
from _data import DECODERS, DECODER_METHODS, LOCATIONS, DOC_STRINGS, DECODERS_BY_SECTION

# Convert the Python data to JSON
data = {
    'decoders': DECODERS,
    'decoder_methods': DECODER_METHODS,
    'locations': LOCATIONS,
    'doc_strings': DOC_STRINGS,
    'decoders_by_section': {k: list(v) for k, v in DECODERS_BY_SECTION.items()}
}

print(json.dumps(data, indent=2))
`;

  try {
    const output = execSync(`python3 -c "${pythonScript}"`, {
      encoding: 'utf8',
      cwd: process.cwd(),
    });
    return JSON.parse(output);
  } catch (error) {
    console.error('Error importing Python data:', error);
    throw error;
  }
}

// Get source locations from existing Node.js scripts
function getSourceLocations(): Record<string, SourceLocation[]> {
  try {
    const decoderLocations = JSON.parse(
      execSync('node ../bin/linenos-decoders.js', { encoding: 'utf8' }),
    );
    const methodLocations = JSON.parse(
      execSync('node ../bin/linenos-Decoder-class.js', { encoding: 'utf8' }),
    );

    return {
      decoders: decoderLocations,
      methods: methodLocations,
    };
  } catch (error) {
    console.error('Error getting source locations:', error);
    return { decoders: [], methods: [] };
  }
}

// Convert Python data to TypeScript-friendly format
function convertData(): DecodersData {
  console.log('Converting Python data to TypeScript...');

  const pythonData = importPythonData();
  const sourceLocations = getSourceLocations();

  // Build locations lookup
  const locations: Record<string, string> = {};
  sourceLocations.decoders.forEach((loc: SourceLocation) => {
    locations[loc.name] = loc.remote;
  });
  sourceLocations.methods.forEach((loc: SourceLocation) => {
    locations[loc.name] = loc.remote;
  });

  // Build doc strings lookup
  const docStrings: Record<string, string> = {};
  sourceLocations.decoders.forEach((loc: SourceLocation) => {
    if (loc.comment) {
      docStrings[loc.name] = loc.comment;
    }
  });
  sourceLocations.methods.forEach((loc: SourceLocation) => {
    if (loc.comment) {
      docStrings[loc.name] = loc.comment;
    }
  });

  return {
    decoders: pythonData.decoders as Record<string, DecoderInfo>,
    decoder_methods: pythonData.decoder_methods as Record<string, DecoderMethodInfo>,
    locations,
    doc_strings: docStrings,
    decoders_by_section: pythonData.decoders_by_section,
  };
}

// Main conversion function
export function generateDataFile(): void {
  const data = convertData();

  const outputPath = resolve('./data/decoders-data.json');
  writeFileSync(outputPath, JSON.stringify(data, null, 2));

  console.log(`✅ Generated ${outputPath}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateDataFile();
}
