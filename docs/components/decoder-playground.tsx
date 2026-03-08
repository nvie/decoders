'use client';

import {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useRef,
  useSyncExternalStore,
} from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Signal } from '@/lib/signals';

type CellResult =
  | { status: 'accepted'; value: string }
  | { status: 'rejected'; error: string };

type Mode = 'verify' | 'value' | 'decode';
type Fmt = 'formatShort' | 'formatInline';

const MODE_OPTIONS: { mode: Mode; label: string; description: string }[] = [
  { mode: 'verify', label: 'Use .verify()', description: 'Value or throw' },
  { mode: 'value', label: 'Use .value()', description: 'Value or undefined' },
  // TODO Commenting out this mode for now, as Annotation does not have an easy visual representation
  // { mode: 'decode', label: 'Use .decode()', description: 'DecodeResult object' },
];

const FMT_OPTIONS: { fmt: Fmt; label: string; description: string }[] = [
  {
    fmt: 'formatInline',
    label: 'formatInline (default)',
    description: 'Annotated with carets',
  },
  { fmt: 'formatShort', label: 'formatShort', description: 'Short summary' },
];

// Module-level signals shared by all playground instances on the page
const mode$ = new Signal<Mode>('verify');
const fmt$ = new Signal<Fmt>('formatInline');

function useSignal<T>(signal: Signal<T>): T {
  return useSyncExternalStore(signal.subscribe, signal.get, signal.get);
}

interface Props {
  /** Expression that evaluates to a decoder, e.g. "string", or an array of [name, expression] tuples for multi-decoder comparison */
  decoder: string | [string, string][];
  /** Input expressions to try, e.g. ["'hello'", "42", "null"] */
  examples: string[];
  /** When set, locks this playground to the given mode (ignoring the global signal) */
  mode?: Mode;
  /** Extra globals to inject into the sandbox, as name → expression pairs evaluated with decoders in scope */
  globals?: Record<string, string>;
  /** Code displayed above the decoder call in the snippet, e.g. an enum definition */
  preface?: string;
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (value instanceof URL) return `URL { href: ${JSON.stringify(value.href)} }`;
  if (value instanceof Date) return `Date { ${JSON.stringify(value.toISOString())} }`;
  if (value instanceof Error)
    return `${value.constructor.name} { ${JSON.stringify(value.message)} }`;
  if (value instanceof Set)
    return `Set(${value.size}) { ${[...value].map(formatValue).join(', ')} }`;
  if (value instanceof Map)
    return `Map(${value.size}) { ${[...value].map(([k, v]) => `${formatValue(k)} => ${formatValue(v)}`).join(', ')} }`;
  try {
    if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
    return JSON.stringify(value, null, 2).replace(/\n\s*/g, ' ');
  } catch {
    return String(value);
  }
}

interface Row {
  input: string;
  cells: (CellResult | undefined)[];
}

// Node.js REPL-style syntax highlighting
const TOKEN_RE =
  /((?:'(?:[^'\\]|\\.)*')|(?:"(?:[^"\\]|\\.)*"))|((?:\d+\.?\d*|\.\d+)(?:n\b)?)|\b(true|false)\b|\b(null)\b|\b(undefined)\b/g;

const COLORS = {
  string: { light: '#0a7e2e', dark: '#98c379' },
  number: { light: '#986801', dark: '#e5c07b' },
  boolean: { light: '#986801', dark: '#e5c07b' },
  null: { light: '#986801', dark: '#e5c07b' },
  undefined: { light: '#7a7a7a', dark: '#7f848e' },
} as const;

function highlight(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(TOKEN_RE)) {
    const idx = match.index!;
    if (idx > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, idx)}</span>);
    }

    const kind = match[1]
      ? 'string'
      : match[2]
        ? 'number'
        : match[3]
          ? 'boolean'
          : match[4]
            ? 'null'
            : 'undefined';

    const c = COLORS[kind];
    parts.push(
      <span key={key++} style={{ color: `light-dark(${c.light}, ${c.dark})` }}>
        {match[0]}
      </span>,
    );
    lastIndex = idx + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  }

  return parts;
}

/**
 * Splits a decoder expression at top-level dots (ignoring dots inside
 * parentheses/brackets), e.g. "string.transform(s => s.split(','))" →
 * ["string", ".transform(s => s.split(','))"].
 */
function splitChain(expr: string): string[] {
  const segments: string[] = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (ch === '(' || ch === '[') depth++;
    else if (ch === ')' || ch === ']') depth--;
    else if (ch === '.' && depth === 0 && i > 0) {
      segments.push(expr.slice(start, i));
      start = i;
    }
  }
  segments.push(expr.slice(start));
  return segments;
}

function dedent(text: string): string {
  const lines = text.split('\n').map((l) => (l.trim() === '//' ? '' : l));
  const nonEmpty = lines.filter((l) => l.trim().length > 0);
  const indent = Math.min(...nonEmpty.map((l) => l.match(/^ */)![0].length));
  return lines
    .map((l) => l.slice(indent))
    .join('\n')
    .trim();
}

function formatSnippet(decoder: string, mode: Mode, input: string, fmt: Fmt): string {
  const fmtArg = mode === 'verify' && fmt === 'formatShort' ? `, ${fmt}` : '';
  const call = `.${mode}(${input}${fmtArg})`;
  const segments = splitChain(decoder);
  if (segments.length <= 1) {
    return `${decoder}${call}`;
  }
  return [segments[0], ...segments.slice(1), call]
    .map((s, i) => (i === 0 ? s : `  ${s}`))
    .join('\n');
}

function statusComment(cell: CellResult | undefined): string {
  if (cell?.status === 'accepted') return '  // accepted \u{1F44D}';
  if (cell?.status === 'rejected') return '  // rejected \u{1F44E}';
  return '';
}

function renderCellContent(
  cell: CellResult | undefined,
  input: string,
  mode: Mode,
): React.ReactNode {
  if (!input) return null;
  if (!cell) return <span className="text-fd-muted-foreground">&hellip;</span>;
  if (cell.status === 'accepted') {
    return <span className="whitespace-pre">{highlight(cell.value)}</span>;
  }
  // In value mode, rejected inputs show "undefined" as a normal value
  if (mode === 'value') {
    return <span className="whitespace-pre">{highlight(cell.error)}</span>;
  }
  return (
    <span
      className="whitespace-pre-wrap"
      style={{ color: 'light-dark(#c4210a, #e5534b)' }}
    >
      {cell.error.trim()}
    </span>
  );
}

export function DecoderPlayground(props: Props) {
  const decoderEntries: [string, string][] =
    typeof props.decoder === 'string' ? [['Result', props.decoder]] : props.decoder;
  const isMulti = decoderEntries.length > 1;
  const decoderKey =
    typeof props.decoder === 'string' ? props.decoder : JSON.stringify(props.decoder);

  const globalMode = useSignal(mode$);
  const mode = props.mode ?? globalMode;
  const fmt = useSignal(fmt$);
  const modeLocked = props.mode !== undefined;
  const showFmt = mode !== 'value';
  const showPopover = !modeLocked || showFmt;
  const [rows, setRows] = useState<Row[]>(() =>
    props.examples.map((input) => ({ input, cells: [] })),
  );
  const [activeRow, setActiveRow] = useState(0);
  const [ready, setReady] = useState(false);
  const compartmentRef = useRef<{ evaluate: (code: string) => unknown }>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<number | null>(null);

  // After mode/fmt change causes a re-render, compensate scroll so this
  // playground stays at the same viewport position.
  useLayoutEffect(() => {
    if (scrollAnchorRef.current !== null && containerRef.current) {
      const newTop = containerRef.current.getBoundingClientRect().top;
      const delta = newTop - scrollAnchorRef.current;
      if (delta !== 0) {
        window.scrollBy(0, delta);
      }
    }
    scrollAnchorRef.current = null;
  });

  const evalCell = useCallback(
    (decoderExpr: string, inputExpr: string, m: Mode, f: Fmt): CellResult | undefined => {
      const compartment = compartmentRef.current;
      if (!inputExpr || !compartment) return undefined;

      try {
        // Check acceptance via .decode()
        const decodeResult = compartment.evaluate(
          `(${decoderExpr}).decode(${inputExpr})`,
        ) as { ok: boolean; value?: unknown; error?: unknown };
        const accepted = decodeResult.ok;

        switch (m) {
          case 'verify': {
            if (accepted) {
              const result = compartment.evaluate(
                `(${decoderExpr}).verify(${inputExpr})`,
              );
              return { status: 'accepted', value: formatValue(result) };
            }
            const formatted = compartment.evaluate(
              `${f}((${decoderExpr}).decode(${inputExpr}).error)`,
            ) as string;
            return { status: 'rejected', error: formatted };
          }

          case 'value': {
            const result = compartment.evaluate(`(${decoderExpr}).value(${inputExpr})`);
            return accepted
              ? { status: 'accepted', value: formatValue(result) }
              : { status: 'rejected', error: formatValue(result) };
          }

          case 'decode': {
            if (accepted) {
              return {
                status: 'accepted',
                value: `{ ok: true, value: ${formatValue(decodeResult.value)} }`,
              };
            }
            const annotation = compartment.evaluate(
              `${f}((${decoderExpr}).decode(${inputExpr}).error)`,
            ) as string;
            return {
              status: 'rejected',
              error: `{ ok: false, error: ${JSON.stringify(annotation)} }`,
            };
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // For verify errors, format using the selected formatter
        if (m === 'verify') {
          try {
            const formatted = compartmentRef.current!.evaluate(
              `${f}((${decoderExpr}).decode(${inputExpr}).error)`,
            ) as string;
            return { status: 'rejected', error: formatted };
          } catch {
            // Fall through to raw message
          }
        }
        return { status: 'rejected', error: msg };
      }
    },
    [],
  );

  // Re-eval all rows synchronously when mode or fmt changes (derived state
  // pattern). This ensures updated row heights are committed in the same
  // render pass, so the useLayoutEffect scroll anchor sees the correct DOM.
  const prevEvalDepsRef = useRef({ mode, fmt });
  if (
    ready &&
    (prevEvalDepsRef.current.mode !== mode || prevEvalDepsRef.current.fmt !== fmt)
  ) {
    prevEvalDepsRef.current = { mode, fmt };
    setRows((prev) =>
      prev.map((row) => ({
        input: row.input,
        cells: decoderEntries.map(([, expr]) => evalCell(expr, row.input, mode, fmt)),
      })),
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await import('ses');

        // Skip lockdown() — it modifies global intrinsics and conflicts with
        // Next.js / React internals. Compartment alone still provides evaluation
        // isolation, which is sufficient for a docs playground.

        const decodersMod = await import('decoders');

        const compartment = new Compartment({ ...decodersMod, URL });

        // Evaluate extra globals (e.g. custom decoders) and inject them
        if (props.globals) {
          for (const [name, expr] of Object.entries(props.globals)) {
            compartment.globalThis[name] = compartment.evaluate(`(${expr})`);
          }
        }

        compartmentRef.current = compartment;

        if (!cancelled) {
          setRows((prev) =>
            prev.map((row) => ({
              input: row.input,
              cells: decoderEntries.map(([, expr]) =>
                evalCell(expr, row.input, mode, fmt),
              ),
            })),
          );
          setReady(true);
        }
      } catch (e) {
        console.error('Failed to initialize playground:', e);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [decoderKey, evalCell, mode, fmt]);

  const updateRow = useCallback(
    (index: number, input: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          input,
          cells: decoderEntries.map(([, expr]) => evalCell(expr, input, mode, fmt)),
        };
        return next;
      });
    },
    [evalCell, mode, fmt, decoderKey],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setRows((prev) => {
          if (index === prev.length - 1 && prev[index].input.trim()) {
            return [...prev, { input: '', cells: [] }];
          }
          return prev;
        });
        setTimeout(() => {
          const inputs = document.querySelectorAll<HTMLInputElement>(
            '[data-playground-input]',
          );
          inputs[index + 1]?.focus();
        });
      }
    },
    [],
  );

  const changeMode = useCallback((m: Mode) => {
    if (containerRef.current) {
      scrollAnchorRef.current = containerRef.current.getBoundingClientRect().top;
    }
    mode$.set(m);
  }, []);

  const changeFmt = useCallback((f: Fmt) => {
    if (containerRef.current) {
      scrollAnchorRef.current = containerRef.current.getBoundingClientRect().top;
    }
    fmt$.set(f);
  }, []);

  const activeRowData = rows[activeRow];
  const activeInput = activeRowData?.input || '\u2026';

  let codeSnippet: string;
  if (isMulti) {
    codeSnippet = decoderEntries
      .map(([, expr], i) => {
        const cell = activeRowData?.cells[i];
        return `${formatSnippet(expr, mode, activeInput, fmt)}${statusComment(cell)}`;
      })
      .join('\n');
  } else {
    const cell = activeRowData?.cells[0];
    codeSnippet = `${formatSnippet(decoderEntries[0][1], mode, activeInput, fmt)}${statusComment(cell)}`;
  }

  let preface = props.preface;
  if (!preface) {
    //
    // TODO Make this auto-import the right thing based on the decoder expression,
    // e.g. if it's "string" or "array(string)", import { string, array } from "decoders"
    //
    // if (typeof props.decoder === 'string') {
    //   const name = props.decoder.split(/[^\w]/g)[0];
    //   preface = `import { ${name} } from "decoders";`;
    // }
  }
  if (preface) {
    codeSnippet = `${dedent(preface)}\n\n${codeSnippet}`;
  }

  const colCount = decoderEntries.length + 1;
  const colWidth = `${100 / colCount}%`;

  return (
    <div
      ref={containerRef}
      className="not-prose my-4 overflow-hidden rounded-lg border border-fd-border text-sm"
    >
      <div className="flex items-center justify-between bg-fd-muted/50 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fd-foreground/80">
          Try it
        </span>
        {showPopover && (
          <Popover>
            <PopoverTrigger className="inline-flex cursor-pointer items-center rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground">
              <ChevronDown className="size-4" />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col p-1">
              {!modeLocked &&
                MODE_OPTIONS.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => {
                      changeMode(opt.mode);
                      document.dispatchEvent(
                        new KeyboardEvent('keydown', { key: 'Escape' }),
                      );
                    }}
                    className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-start text-sm hover:bg-fd-accent hover:text-fd-accent-foreground"
                  >
                    <Check
                      className={`mt-0.5 size-4 shrink-0 ${mode === opt.mode ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-fd-muted-foreground">
                        {opt.description}
                      </span>
                    </span>
                  </button>
                ))}
              {!modeLocked && showFmt && <hr className="my-1 border-fd-border" />}
              {showFmt &&
                FMT_OPTIONS.map((opt) => (
                  <button
                    key={opt.fmt}
                    onClick={() => {
                      changeFmt(opt.fmt);
                      document.dispatchEvent(
                        new KeyboardEvent('keydown', { key: 'Escape' }),
                      );
                    }}
                    className="flex cursor-pointer items-start gap-2 rounded-lg p-2 text-start text-sm hover:bg-fd-accent hover:text-fd-accent-foreground"
                  >
                    <Check
                      className={`mt-0.5 size-4 shrink-0 ${fmt === opt.fmt ? 'opacity-100' : 'opacity-0'}`}
                    />
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{opt.label}</span>
                      <span className="text-xs text-fd-muted-foreground">
                        {opt.description}
                      </span>
                    </span>
                  </button>
                ))}
            </PopoverContent>
          </Popover>
        )}
      </div>
      <div className="border-b border-fd-border [&_figure]:!m-0 [&_figure]:!rounded-none [&_figure]:!border-0 [&_figure]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:!py-1.5 [&_button]:!hidden">
        <DynamicCodeBlock lang="ts" code={codeSnippet} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-fd-border text-left text-xs text-fd-muted-foreground">
              <th
                className="px-3 py-2 font-medium"
                style={{ width: colWidth, minWidth: 150 }}
              >
                Input
              </th>
              {decoderEntries.map(([name]) => (
                <th
                  key={name}
                  className="px-3 py-2 font-medium"
                  style={{ width: colWidth, minWidth: 150 }}
                >
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((row, i) => (
              <tr
                key={i}
                onClick={() => setActiveRow(i)}
                className={`border-b border-fd-border last:border-b-0 align-top cursor-pointer ${activeRow === i ? 'bg-black/[0.02] dark:bg-white/[0.04]' : ''}`}
              >
                <td className="px-3 py-1.5">
                  <input
                    data-playground-input
                    type="text"
                    value={row.input}
                    onChange={(e) => updateRow(i, e.target.value)}
                    onFocus={() => setActiveRow(i)}
                    onKeyDown={(e) => handleKeyDown(e, i)}
                    placeholder="Type an expression\u2026"
                    disabled={!ready}
                    className="w-full bg-transparent text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none"
                  />
                </td>
                {decoderEntries.map(([name], j) => (
                  <td key={name} className="px-3 py-1.5">
                    {renderCellContent(row.cells[j], row.input, mode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
