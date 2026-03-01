#!/usr/bin/env node

/**
 * Updates the `source` props on <DecoderSig> and <Sig> components in MDX files
 * to reflect the current line numbers in the source files.
 *
 * Usage: node bin/update-source-lines.js
 */

import { Project, SyntaxKind, Node } from 'ts-morph';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const DOCS_API = path.join(ROOT, 'docs', 'content', 'docs', 'api');

// ---------------------------------------------------------------------------
// Step 1: Build a source map of all declarations and their line ranges
// ---------------------------------------------------------------------------

const project = new Project({
  tsConfigFilePath: path.join(ROOT, 'tsconfig.json'),
});

// Map: "file.ts" -> Map("name" -> { start, end })
const sourceMap = new Map();

function addEntry(file, name, start, end) {
  if (!sourceMap.has(file)) sourceMap.set(file, new Map());
  sourceMap.get(file).set(name, { start, end });
}

/** Return the JSDoc start line for a node, or null. */
function jsDocStartLine(node) {
  if (Node.isJSDocable(node)) {
    const docs = node.getJsDocs();
    if (docs.length > 0) return docs[0].getStartLineNumber();
  }
  return null;
}

/**
 * Get the full line range for a declaration including JSDoc and any
 * preceding overload signatures.
 */
function declRange(node) {
  let start = jsDocStartLine(node) ?? node.getStartLineNumber();
  const end = node.getEndLineNumber();

  // For function implementations with overloads, include the overloads
  if (Node.isFunctionDeclaration(node) && node.hasBody()) {
    const overloads = node.getOverloads();
    if (overloads.length > 0) {
      const first = overloads[0];
      const overloadStart =
        jsDocStartLine(first) ?? first.getStartLineNumber();
      start = Math.min(start, overloadStart);
    }
  }

  return { start, end };
}

// Process all source files under src/
for (const sf of project.getSourceFiles()) {
  const filePath = sf.getFilePath();
  if (!filePath.startsWith(SRC_DIR + '/')) continue;
  const relPath = path.relative(SRC_DIR, filePath);

  for (const stmt of sf.getStatements()) {
    // export const name = ...
    if (Node.isVariableStatement(stmt) && stmt.hasExportKeyword()) {
      const { start, end } = declRange(stmt);
      for (const decl of stmt.getDeclarationList().getDeclarations()) {
        addEntry(relPath, decl.getName(), start, end);
      }
    }

    // export function name(...) { ... }
    if (Node.isFunctionDeclaration(stmt) && stmt.hasExportKeyword()) {
      const name = stmt.getName();
      if (!name || !stmt.hasBody()) continue; // skip overload signatures
      const { start, end } = declRange(stmt);
      addEntry(relPath, name, start, end);
    }
  }
}

// Special: inner functions inside `define()` in core/Decoder.ts
const decoderFile = project.getSourceFile(
  path.join(SRC_DIR, 'core', 'Decoder.ts'),
);
if (decoderFile) {
  const defineFunc = decoderFile.getFunction('define');
  if (defineFunc && defineFunc.hasBody()) {
    // `define` itself (exported)
    const { start, end } = declRange(defineFunc);
    addEntry('core/Decoder.ts', 'define', start, end);

    // Inner functions (Decoder methods)
    const body = defineFunc.getBody();
    for (const stmt of body.getStatements()) {
      if (Node.isFunctionDeclaration(stmt)) {
        const name = stmt.getName();
        if (!name || !stmt.hasBody()) continue;
        const { start, end } = declRange(stmt);
        addEntry('core/Decoder.ts', `.${name}`, start, end);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Step 2: Update MDX files
// ---------------------------------------------------------------------------

const mdxFiles = fs
  .readdirSync(DOCS_API)
  .filter((f) => f.endsWith('.mdx'))
  .map((f) => path.join(DOCS_API, f));

// Regex to match self-closing <DecoderSig .../> and <Sig .../> tags (possibly multiline)
const tagRe = /<(DecoderSig|Sig)\b([\s\S]*?)\/>/g;
const nameRe = /name="([^"]+)"/;
const sourceRe = /source="([^"]+)"/;

let totalUpdated = 0;

for (const mdxPath of mdxFiles) {
  const original = fs.readFileSync(mdxPath, 'utf8');

  const updated = original.replace(tagRe, (fullMatch, tagName, attrs) => {
    const nameMatch = attrs.match(nameRe);
    const sourceMatch = attrs.match(sourceRe);
    if (!nameMatch || !sourceMatch) return fullMatch;

    const name = nameMatch[1];
    const oldSource = sourceMatch[1];

    // Parse old source to get the file reference: "file.ts#Lstart-Lend"
    const hashIdx = oldSource.indexOf('#');
    if (hashIdx === -1) return fullMatch;
    const file = oldSource.slice(0, hashIdx);

    // Look up the actual line range
    const fileEntries = sourceMap.get(file);
    if (!fileEntries) {
      console.warn(`  ⚠ No source map for file: ${file} (name="${name}")`);
      return fullMatch;
    }
    const range = fileEntries.get(name);
    if (!range) {
      console.warn(
        `  ⚠ No declaration found for "${name}" in ${file}`,
      );
      return fullMatch;
    }

    const newSource = `${file}#L${range.start}-L${range.end}`;
    if (oldSource === newSource) return fullMatch;

    totalUpdated++;
    return fullMatch.replace(`source="${oldSource}"`, `source="${newSource}"`);
  });

  if (updated !== original) {
    fs.writeFileSync(mdxPath, updated);
    console.log(`Updated ${path.relative(ROOT, mdxPath)}`);
  }
}

if (totalUpdated === 0) {
  console.log('All source lines are up to date.');
} else {
  console.log(`\nUpdated ${totalUpdated} source reference(s).`);
}
