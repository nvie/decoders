'use client';

import { useState, useEffect, useLayoutEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from 'fumadocs-ui/components/ui/popover';
import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';
import { Signal } from '@/lib/signals';

type EvalResult = { ok: true; value: string } | { ok: false; error: string };

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
  /** Expression that evaluates to a decoder, e.g. "string" */
  decoder: string;
  /** Input expressions to try, e.g. ["'hello'", "42", "null"] */
  examples: string[];
}

function formatValue(value: unknown): string {
  if (typeof value === 'string') return JSON.stringify(value);
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'bigint') return `${value}n`;
  if (value instanceof URL) return `URL { ${value.href} }`;
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

interface Row {
  input: string;
  result?: EvalResult;
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

export function DecoderPlayground({ decoder, examples }: Props) {
  const mode = useSignal(mode$);
  const fmt = useSignal(fmt$);
  const [rows, setRows] = useState<Row[]>(() => examples.map((input) => ({ input })));
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

  const evalInput = useCallback(
    (inputExpr: string, m: Mode, f: Fmt): EvalResult | undefined => {
      const compartment = compartmentRef.current;
      if (!inputExpr || !compartment) return undefined;

      try {
        switch (m) {
          case 'verify': {
            const code = `(${decoder}).verify(${inputExpr})`;
            const result = compartment.evaluate(code);
            return { ok: true, value: formatValue(result) };
          }

          case 'value': {
            const code = `(${decoder}).value(${inputExpr})`;
            const result = compartment.evaluate(code);
            return { ok: true, value: formatValue(result) };
          }

          case 'decode': {
            const result = compartment.evaluate(`(${decoder}).decode(${inputExpr})`) as {
              ok: boolean;
              value?: unknown;
              error?: unknown;
            };
            if (result.ok) {
              return {
                ok: true,
                value: `{ ok: true, value: ${formatValue(result.value)} }`,
              };
            }
            const annotation = compartment.evaluate(
              `${f}((${decoder}).decode(${inputExpr}).error)`,
            ) as string;
            return {
              ok: true,
              value: `{ ok: false, error: ${JSON.stringify(annotation)} }`,
            };
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        // For verify errors, format using the selected formatter
        if (m === 'verify') {
          try {
            const formatted = compartment.evaluate(
              `${f}((${decoder}).decode(${inputExpr}).error)`,
            ) as string;
            return { ok: false, error: formatted };
          } catch {
            // Fall through to raw message
          }
        }
        return { ok: false, error: msg };
      }
    },
    [decoder],
  );

  // Re-eval all rows synchronously when mode or fmt changes (derived state
  // pattern). This ensures updated row heights are committed in the same
  // render pass, so the useLayoutEffect scroll anchor sees the correct DOM.
  const prevEvalDepsRef = useRef({ mode, fmt });
  if (
    ready &&
    (prevEvalDepsRef.current.mode !== mode ||
      prevEvalDepsRef.current.fmt !== fmt)
  ) {
    prevEvalDepsRef.current = { mode, fmt };
    setRows((prev) =>
      prev.map((row) => ({
        input: row.input,
        result: evalInput(row.input, mode, fmt),
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

        compartmentRef.current = new Compartment({ ...decodersMod });

        if (!cancelled) {
          setRows((prev) =>
            prev.map((row) => ({
              input: row.input,
              result: evalInput(row.input, mode, fmt),
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
  }, [decoder, evalInput, mode, fmt]);

  const updateRow = useCallback(
    (index: number, input: string) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = { input, result: evalInput(input, mode, fmt) };
        return next;
      });
    },
    [evalInput, mode, fmt],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        setRows((prev) => {
          if (index === prev.length - 1 && prev[index].input.trim()) {
            return [...prev, { input: '' }];
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

  const changeMode = useCallback(
    (m: Mode) => {
      if (containerRef.current) {
        scrollAnchorRef.current = containerRef.current.getBoundingClientRect().top;
      }
      mode$.set(m);
    },
    [],
  );

  const changeFmt = useCallback(
    (f: Fmt) => {
      if (containerRef.current) {
        scrollAnchorRef.current = containerRef.current.getBoundingClientRect().top;
      }
      fmt$.set(f);
    },
    [],
  );

  return (
    <div ref={containerRef} className="not-prose my-4 overflow-hidden rounded-lg border border-fd-border text-sm">
      <div className="flex items-center justify-between bg-fd-muted/50 px-3 py-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fd-foreground/80">
          Try it
        </span>
        <Popover>
          <PopoverTrigger className="inline-flex cursor-pointer items-center rounded p-1 text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground">
            <ChevronDown className="size-4" />
          </PopoverTrigger>
          <PopoverContent className="flex flex-col p-1">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.mode}
                onClick={() => {
                  changeMode(opt.mode);
                  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
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
            <hr className="my-1 border-fd-border" />
            {FMT_OPTIONS.map((opt) => {
              const disabled = mode === 'value';
              return (
                <button
                  key={opt.fmt}
                  disabled={disabled}
                  onClick={() => {
                    changeFmt(opt.fmt);
                    document.dispatchEvent(
                      new KeyboardEvent('keydown', { key: 'Escape' }),
                    );
                  }}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg p-2 text-start text-sm ${
                    disabled
                      ? 'cursor-default opacity-40'
                      : 'hover:bg-fd-accent hover:text-fd-accent-foreground'
                  }`}
                >
                  <Check
                    className={`mt-0.5 size-4 shrink-0 ${fmt === opt.fmt && !disabled ? 'opacity-100' : 'opacity-0'}`}
                  />
                  <span className="flex flex-col gap-0.5">
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-fd-muted-foreground">
                      {opt.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>
      </div>
      <div className="border-b border-fd-border [&_figure]:!m-0 [&_figure]:!rounded-none [&_figure]:!border-0 [&_figure]:!bg-transparent [&_pre]:!bg-transparent [&_pre]:!text-xs [&_pre]:!py-1.5 [&_pre]:!px-3 [&_button]:!hidden">
        <DynamicCodeBlock
          lang="ts"
          code={`${decoder}.${mode}(${rows[activeRow]?.input || '…'}${mode === 'verify' && fmt === 'formatShort' ? `, ${fmt}` : ''})`}
        />
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-fd-border text-left text-xs text-fd-muted-foreground">
            <th className="w-1/2 px-3 py-2 font-medium">Input</th>
            <th className="w-1/2 px-3 py-2 font-medium">Result</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              onClick={() => setActiveRow(i)}
              className={`border-b border-fd-border last:border-b-0 align-top cursor-pointer ${activeRow === i ? 'bg-fd-muted/30' : ''}`}
            >
              <td className="px-3 py-1.5">
                <input
                  data-playground-input
                  type="text"
                  value={row.input}
                  onChange={(e) => updateRow(i, e.target.value)}
                  onFocus={() => setActiveRow(i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  placeholder="Type an expression…"
                  disabled={!ready}
                  className="w-full bg-transparent font-mono text-xs text-fd-foreground placeholder:text-fd-muted-foreground focus:outline-none"
                />
              </td>
              <td className="px-3 py-1.5">
                {!row.input ? null : !row.result ? (
                  <span className="text-fd-muted-foreground">&hellip;</span>
                ) : row.result.ok ? (
                  <code className="text-xs">{highlight(row.result.value)}</code>
                ) : (
                  <div
                    className="whitespace-pre-wrap text-xs"
                    style={{ color: 'light-dark(#c4210a, #e5534b)' }}
                  >
                    <pre className="inline">{row.result.error.trim()}</pre>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
