import { execSync } from 'child_process';
import { mkdirSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import type { DecodersData, DecoderInfo } from './types.js';

// Import the Python data by executing the Python script and parsing the output
function importPythonData(): any {
  const docsPath = resolve('./docs').replace(/\\/g, '/');
  const pythonScript = `
import sys
import json
sys.path.append('${docsPath}')
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
function getSourceLocations(): { decoders: any[]; methods: any[] } {
  try {
    const decoderLocations = JSON.parse(
      execSync('node bin/linenos-decoders.js', { encoding: 'utf8' }),
    );
    const methodLocations = JSON.parse(
      execSync('node bin/linenos-Decoder-class.js', { encoding: 'utf8' }),
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
  console.log('📥 Converting Python data to TypeScript...');

  const pythonData = importPythonData();
  const sourceLocations = getSourceLocations();

  // Build locations lookup
  const locations: Record<string, string> = {};
  sourceLocations.decoders.forEach((loc: any) => {
    locations[loc.name] = loc.remote;
  });
  sourceLocations.methods.forEach((loc: any) => {
    locations[loc.name] = loc.remote;
  });

  // Build doc strings lookup
  const docStrings: Record<string, string> = {};
  sourceLocations.decoders.forEach((loc: any) => {
    if (loc.comment) {
      docStrings[loc.name] = loc.comment;
    }
  });
  sourceLocations.methods.forEach((loc: any) => {
    if (loc.comment) {
      docStrings[loc.name] = loc.comment;
    }
  });

  return {
    decoders: pythonData.decoders,
    decoder_methods: pythonData.decoder_methods,
    locations,
    doc_strings: docStrings,
    decoders_by_section: pythonData.decoders_by_section,
  };
}

// Generate individual decoder pages
function generateDecoderPages(data: DecodersData): void {
  console.log('📄 Generating individual decoder pages...');

  Object.entries(data.decoders).forEach(([name, decoder]) => {
    if (decoder.alias_of) return; // Skip aliases for now

    const content = generateDecoderPageContent(name, decoder, data);
    const filePath = resolve(`docs-new/api/${name}.md`);

    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, content);
  });
}

function generateDecoderPageContent(
  name: string,
  decoder: DecoderInfo,
  data: DecodersData,
): string {
  const sourceLink = data.locations[name];
  const docString = data.doc_strings[name];

  let content = `---
title: ${name}
description: ${decoder.section} decoder
---

# \`${name}\` decoder

`;

  // Add signature
  if (decoder.signatures) {
    decoder.signatures.forEach((sig) => {
      const typeParams = sig.type_params ? `<${sig.type_params.join(', ')}>` : '';
      const params = sig.params
        ? '(' +
          sig.params
            .map(([pname, ptype]) => (pname ? `${pname}: ${ptype}` : ptype))
            .join(', ') +
          ')'
        : '()';

      content += `\`\`\`typescript
${name}${typeParams}${params}: ${sig.return_type}
\`\`\`

`;
    });
  } else {
    const typeParams = decoder.type_params ? `<${decoder.type_params.join(', ')}>` : '';
    const params = decoder.params
      ? '(' +
        decoder.params.map(([pname, ptype]) => `${pname}: ${ptype}`).join(', ') +
        ')'
      : decoder.return_type
        ? '()'
        : '';
    const returnType = decoder.return_type ? `: ${decoder.return_type}` : '';

    content += `\`\`\`typescript
${name}${typeParams}${params}${returnType}
\`\`\`

`;
  }

  // Add source link
  if (sourceLink) {
    content += `[View source](${sourceLink})

`;
  }

  // Add description from docstring or markdown
  if (decoder.markdown) {
    content += `${decoder.markdown}

`;
  } else if (docString) {
    content += `${docString}

`;
  }

  // Add interactive playground
  // Use better decoder names for parameterized decoders
  const displayDecoderName = getDisplayDecoderName(name);

  content += `## Interactive Examples

Try different inputs and see the results in real-time:

<DecoderPlayground decoder-name="${displayDecoderName}" />

`;

  // Add static example if it exists
  if (decoder.example) {
    content += `## Code Examples

`;
    if (decoder.example.includes('```')) {
      content += decoder.example;
    } else {
      content += `\`\`\`typescript
${decoder.example.trim()}
\`\`\``;
    }
    content += `

`;
  }

  // Add aliases
  if (decoder.aliases && decoder.aliases.length > 0) {
    content += `## Aliases

${decoder.aliases.map((alias) => `- \`${alias}\``).join('\n')}

`;
  }

  return content;
}

// Get better display names for parameterized decoders
function getDisplayDecoderName(name: string): string {
  const displayNames: Record<string, string> = {
    // Arrays
    array: 'array(string)',
    nonEmptyArray: 'nonEmptyArray(string)',
    tuple: 'tuple(string, number)',

    // Objects
    object: 'object({ x: number })',
    exact: 'exact({ x: number })',
    inexact: 'inexact({ x: number })',

    // Collections
    record: 'record(number)',
    dict: 'dict(number)',
    mapping: 'mapping(number)',
    setFromArray: 'setFromArray(string)',
    set: 'setFromArray(string)', // set is alias of setFromArray

    // Optionals
    optional: 'optional(string)',
    nullable: 'nullable(string)',
    nullish: 'nullish(string)',

    // Unions
    either: 'either(string, number)',
    oneOf: 'oneOf(["foo", "bar", "baz"])',
    taggedUnion:
      'taggedUnion("type", { user: object({ name: string }), admin: object({ permissions: array(string) }) })',
    select:
      'select(object({ version: optional(number) }), (obj) => obj.version === 2 ? v2Decoder : v1Decoder)',

    // String validators with parameters
    regex: 'regex(/^[0-9]+$/, "Must be numeric")',
    startsWith: 'startsWith("hello")',
    endsWith: 'endsWith("world")',
    nanoid: 'nanoid({ size: 10 })',

    // Constants
    constant: 'constant("hello")',
    always: 'always(42)',

    // Utilities
    define:
      'define((blob, ok, err) => typeof blob === "string" ? ok(blob.toUpperCase()) : err("Must be string"))',
    prep: 'prep(x => parseInt(x), positiveInteger)',
    instanceOf: 'instanceOf(Error)',
    lazy: 'lazy(() => treeDecoder)',

    // Enum (special case)
    enum_: 'enum_(Fruit)', // Where Fruit is an enum
  };

  return displayNames[name] || name;
}

// Copy assets
function copyAssets(): void {
  console.log('📋 Copying assets...');
  execSync('cp -r docs/assets/* docs-new/public/ 2>/dev/null || true');
}

// Main generation function
function generateDocs(): void {
  console.log('🚀 Generating VitePress documentation...');

  try {
    const data = convertData();

    // Save data file
    const dataPath = resolve('docs-new/data/decoders-data.json');
    mkdirSync(dirname(dataPath), { recursive: true });
    writeFileSync(dataPath, JSON.stringify(data, null, 2));

    generateDecoderPages(data);
    copyAssets();

    console.log('✅ Documentation generation complete!');
  } catch (error) {
    console.error('❌ Error generating documentation:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateDocs();
}

export { generateDocs };
