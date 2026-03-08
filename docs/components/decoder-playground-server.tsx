import * as decoders from 'decoders';
import { DecoderPlayground as DecoderPlaygroundClient } from './decoder-playground';
import type { CellResult, Mode } from '@/lib/playground-types';
import { formatValue } from '@/lib/playground-types';

interface Props {
  decoder: string | [string, string][];
  examples: string[];
  mode?: Mode;
  globals?: Record<string, string>;
  preface?: string;
}

function evalCell(
  context: Record<string, unknown>,
  decoderExpr: string,
  inputExpr: string,
  mode: Mode,
  fmt: string,
): CellResult | undefined {
  if (!inputExpr) return undefined;

  const keys = Object.keys(context);
  const vals = Object.values(context);

  try {
    const decodeFn = new Function(
      ...keys,
      `return (${decoderExpr}).decode(${inputExpr})`,
    );
    const decodeResult = decodeFn(...vals) as {
      ok: boolean;
      value?: unknown;
      error?: unknown;
    };
    const accepted = decodeResult.ok;

    switch (mode) {
      case 'verify': {
        if (accepted) {
          const verifyFn = new Function(
            ...keys,
            `return (${decoderExpr}).verify(${inputExpr})`,
          );
          return { status: 'accepted', value: formatValue(verifyFn(...vals)) };
        }
        const fmtFn = new Function(
          ...keys,
          `return ${fmt}((${decoderExpr}).decode(${inputExpr}).error)`,
        );
        return { status: 'rejected', error: fmtFn(...vals) as string };
      }

      case 'value': {
        const valueFn = new Function(
          ...keys,
          `return (${decoderExpr}).value(${inputExpr})`,
        );
        const result = valueFn(...vals);
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
        const fmtFn = new Function(
          ...keys,
          `return ${fmt}((${decoderExpr}).decode(${inputExpr}).error)`,
        );
        return {
          status: 'rejected',
          error: `{ ok: false, error: ${JSON.stringify(fmtFn(...vals))} }`,
        };
      }
    }
  } catch {
    return undefined;
  }
}

function computeInitialResults(
  decoderEntries: [string, string][],
  examples: string[],
  mode: Mode,
  globals?: Record<string, string>,
): (CellResult | undefined)[][] {
  try {
    const context: Record<string, unknown> = { ...decoders, URL };

    if (globals) {
      for (const [name, expr] of Object.entries(globals)) {
        const keys = Object.keys(context);
        const vals = Object.values(context);
        const fn = new Function(...keys, `return (${expr})`);
        context[name] = fn(...vals);
      }
    }

    return examples.map((input) =>
      decoderEntries.map(([, expr]) =>
        evalCell(context, expr, input, mode, 'formatInline'),
      ),
    );
  } catch {
    return examples.map(() => decoderEntries.map(() => undefined));
  }
}

export function DecoderPlayground(props: Props) {
  const decoderEntries: [string, string][] =
    typeof props.decoder === 'string' ? [['Result', props.decoder]] : props.decoder;
  const mode = props.mode ?? 'verify';
  const initialResults = computeInitialResults(
    decoderEntries,
    props.examples,
    mode,
    props.globals,
  );

  return <DecoderPlaygroundClient {...props} initialResults={initialResults} />;
}
