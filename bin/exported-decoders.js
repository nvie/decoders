import { Project } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

// NOTE: This is a bit caveman-style. Ideally, we would write the loop below to
// check if these are _type_ exports or not. But I haven't figured out yet how
// to do that programmatically.
const NOT_DECODERS = new Set([
  'Decoder',
  'DecodeResult',
  'DecoderType',
  'JSONArray',
  'JSONObject',
  'JSONValue',
  'Scalar',

  // Formatters
  'Formatter',
  'formatInline',
  'formatShort',

  // Results
  'Result',
  'Err',
  'err',
  'Ok',
  'ok',
]);

for (const src of project.getSourceFiles('src/index.ts')) {
  for (const sym of src.getExportSymbols()) {
    const name = sym.getName();
    if (!NOT_DECODERS.has(name)) {
      console.log(name);
    }
  }
}
