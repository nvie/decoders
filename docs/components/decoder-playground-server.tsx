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
    // Evaluate the input expression once and reuse the result, so
    // non-deterministic expressions (e.g. Math.random()) are consistent.
    const inputFn = new Function(...keys, `return (${inputExpr})`);
    const inputValue = inputFn(...vals);

    const keysWithInput = [...keys, '__input__'];
    const valsWithInput = [...vals, inputValue];

    const decodeFn = new Function(
      ...keysWithInput,
      `return (${decoderExpr}).decode(__input__)`,
    );
    const decodeResult = decodeFn(...valsWithInput) as {
      ok: boolean;
      value?: unknown;
      error?: unknown;
    };
    const accepted = decodeResult.ok;

    switch (mode) {
      case 'verify': {
        if (accepted)
          return { status: 'accepted', value: formatValue(decodeResult.value) };

        const fmtFn = new Function(
          ...keysWithInput,
          `return ${fmt}((${decoderExpr}).decode(__input__).error)`,
        );
        return { status: 'rejected', error: fmtFn(...valsWithInput) as string };
      }

      case 'value': {
        return accepted
          ? { status: 'accepted', value: formatValue(decodeResult.value) }
          : { status: 'rejected', error: formatValue(undefined) };
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
