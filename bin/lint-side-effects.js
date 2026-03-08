// Lint rule: ensure all exported Decoder declarations have tree-shaking
// annotations so bundlers can eliminate unused decoders.
//
// Usage: node bin/check-side-effects.js
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({
  tsConfigFilePath: './tsconfig.json',
});

const violations = [];

function involvesDecoder(type) {
  return type.getText().includes('Decoder');
}

// Check if the leading comments of a node contain a given marker.
function hasMarker(node, marker) {
  const fullText = node.getSourceFile().getFullText();
  const ranges = node.getLeadingCommentRanges();
  for (const range of ranges) {
    const comment = fullText.slice(range.getPos(), range.getEnd());
    if (comment.includes(marker)) return true;
  }
  return false;
}

// Check if a const declaration has a PURE or IMPURE comment anywhere between
// the `=` and the call expression (covers multiline cases with comments).
function hasPureOrImpure(varDecl, initNode) {
  const src = varDecl.getSourceFile().getFullText();
  // Look from the variable declaration start to just past the initializer start
  const from = varDecl.getStart();
  const to = initNode.getEnd();
  const region = src.slice(from, to);
  return region.includes('#__PURE__') || region.includes('#__IMPURE__');
}

// Resolve a symbol to its original declaration, following re-exports and aliases.
function resolveSymbol(symbol) {
  if (!symbol) return symbol;
  // getAliasedSymbol follows re-exports like `export { define } from './Decoder'`
  try {
    const aliased = symbol.getAliasedSymbol?.();
    if (aliased && aliased !== symbol) return aliased;
  } catch {
    // getAliasedSymbol can throw for some symbol types
  }
  return symbol;
}

// Check if the called function already has a NO_SIDE_EFFECTS annotation.
// NOTE: This only covers free function calls, not method calls. Bundlers
// cannot infer purity of method calls like .transform()/.refine(), so those
// always need an explicit /* #__PURE__ */ annotation.
function calledFnHasNoSideEffects(callExpr) {
  if (callExpr.getKind() !== SyntaxKind.CallExpression) return false;

  // Method calls always need explicit annotation — bundlers can't infer purity
  const expr = callExpr.getExpression();
  if (expr.getKind() === SyntaxKind.PropertyAccessExpression) return false;
  const symbol = resolveSymbol(expr.getSymbol());
  if (!symbol) return false;

  for (const decl of symbol.getDeclarations()) {
    if (
      decl.getKind() === SyntaxKind.FunctionDeclaration ||
      decl.getKind() === SyntaxKind.FunctionExpression
    ) {
      const overloads = decl.getOverloads?.() ?? [];
      const all = [decl, ...overloads];
      if (all.some((n) => hasMarker(n, '#__NO_SIDE_EFFECTS__'))) return true;
    }
  }

  return false;
}

function loc(node) {
  const file = node.getSourceFile().getFilePath().replace(process.cwd() + '/', '');
  const line = node.getStartLineNumber();
  return `${file}:${line}`;
}

for (const src of project.getSourceFiles('src/**/*.ts')) {
  // 1. Exported functions returning a Decoder
  for (const fn of src.getFunctions()) {
    if (!fn.isExported()) continue;
    if (!involvesDecoder(fn.getReturnType())) continue;

    // The annotation must be on the implementation, not on an overload
    // signature. TypeScript erases overload signatures, so annotations
    // placed there won't survive into the JS output.
    const hasOnImpl = hasMarker(fn, '#__NO_SIDE_EFFECTS__') || hasMarker(fn, '#__SIDE_EFFECTS__');

    if (!hasOnImpl) {
      const overloads = fn.getOverloads();
      const hasOnOverload = overloads.some(
        (n) => hasMarker(n, '#__NO_SIDE_EFFECTS__') || hasMarker(n, '#__SIDE_EFFECTS__'),
      );
      violations.push({
        loc: loc(fn),
        name: fn.getName(),
        kind: 'function',
        onOverload: hasOnOverload,
      });
    }
  }

  // 2. Exported const declarations initialized with a call expression
  for (const decl of src.getVariableDeclarations()) {
    const stmt = decl.getVariableStatement();
    if (!stmt) continue;
    if (!stmt.isExported()) continue;
    if (!involvesDecoder(decl.getType())) continue;

    const init = decl.getInitializer();
    if (!init) continue;

    const kind = init.getKind();
    if (kind !== SyntaxKind.CallExpression && kind !== SyntaxKind.TaggedTemplateExpression) {
      continue;
    }

    // Skip if the called function already has NO_SIDE_EFFECTS
    if (calledFnHasNoSideEffects(init)) continue;

    if (!hasPureOrImpure(decl, init)) {
      violations.push({
        loc: loc(decl),
        name: decl.getName(),
        kind: 'const',
      });
    }
  }
}

if (violations.length > 0) {
  console.error(`\
Tree-shaking annotation check
==============================

Bundlers need explicit annotations to tree-shake unused decoders:

  - Exported functions returning a Decoder need /* #__NO_SIDE_EFFECTS__ */
    so that all call sites are automatically tree-shakeable.

  - Exported const Decoders initialized with a call expression need
    /* #__PURE__ */ before the call, unless the called function already
    has /* #__NO_SIDE_EFFECTS__ */.

Without these, bundlers must assume side effects and will include
unused decoders in the output bundle.

Violations:
`);

  for (const v of violations) {
    if (v.kind === 'function' && v.onOverload) {
      console.error(`  ${v.loc}: function "${v.name}" - annotation is on overload signature, move to implementation`);
    } else if (v.kind === 'function') {
      console.error(`  ${v.loc}: function "${v.name}"`);
    } else {
      console.error(`  ${v.loc}: const "${v.name}"`);
    }
  }

  console.error(`
How to fix:

  For functions:
    /* #__NO_SIDE_EFFECTS__ */              <-- default: no side effects
    export function myDecoder(...) { ... }

    /* #__SIDE_EFFECTS__ */                 <-- opt-out: has side effects
    export function myDecoder(...) { ... }

  For overloaded functions, the annotation MUST be on the implementation,
  not on an overload signature. TypeScript erases overload signatures, so
  annotations there won't survive into the JS output.

  For const declarations:
    export const foo = /* #__PURE__ */ define(...)     <-- default: pure
    export const foo = /* #__IMPURE__ */ define(...)   <-- opt-out: impure

${violations.length} violation(s) found.
`);
  process.exit(1);
} else {
  console.log('All Decoder exports have proper tree-shaking annotations.');
}
