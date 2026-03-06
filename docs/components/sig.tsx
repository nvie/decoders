import type { ReactNode } from 'react';
import { Info } from './info';

const REPO = 'https://github.com/nvie/decoders/tree/main/src';
const TEAL = '#267f99';
const GRAY = '#6b7280';

/**
 * Split a string by a delimiter, but only at the top level
 * (not inside <>, (), {}, or []).
 */
function splitAtTopLevel(str: string, delimiter: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<' || ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === '>' || ch === ')' || ch === '}' || ch === ']') depth--;
    if (depth === 0 && str.slice(i, i + delimiter.length) === delimiter) {
      parts.push(current);
      current = '';
      i += delimiter.length - 1;
    } else {
      current += ch;
    }
  }
  if (current) parts.push(current);
  return parts;
}

/**
 * Find the index of the first top-level ": " in a string.
 */
function findTopLevelColon(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '<' || ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === '>' || ch === ')' || ch === '}' || ch === ']') depth--;
    if (depth === 0 && str.slice(i, i + 2) === ': ') return i;
  }
  return -1;
}

/**
 * Find all `Decoder<...>` occurrences in a type string (respecting bracket
 * depth) and render the `Decoder<` and `>` wrapper parts in gray while
 * keeping the inner type in teal.
 */
function renderType(type: string): ReactNode {
  const parts: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < type.length) {
    const decoderIdx = type.indexOf('Decoder<', i);
    if (decoderIdx === -1) {
      // No more Decoder< — push the rest as teal
      if (i < type.length) {
        parts.push(
          <span key={key++} style={{ color: TEAL }}>
            {type.slice(i)}
          </span>,
        );
      }
      break;
    }

    // Push text before Decoder< as teal
    if (decoderIdx > i) {
      parts.push(
        <span key={key++} style={{ color: TEAL }}>
          {type.slice(i, decoderIdx)}
        </span>,
      );
    }

    // Find the matching closing >
    let depth = 0;
    let j = decoderIdx + 'Decoder<'.length;
    for (; j < type.length; j++) {
      if (type[j] === '<') depth++;
      else if (type[j] === '>') {
        if (depth === 0) break;
        depth--;
      }
    }

    const inner = type.slice(decoderIdx + 'Decoder<'.length, j);
    parts.push(
      <span key={key++}>
        <span style={{ color: GRAY }}>{'Decoder<'}</span>
        <span style={{ color: TEAL }}>{inner}</span>
        <span style={{ color: GRAY }}>{'>'}</span>
      </span>,
    );

    i = j + 1;
  }

  return <span>{parts}</span>;
}

/**
 * Render params with styling: param names in gray, types in teal italic,
 * with Decoder<...> wrappers in gray.
 */
function renderParams(params: string): ReactNode {
  const paramList = splitAtTopLevel(params, ', ');
  return paramList.map((param, i) => {
    const colonIdx = findTopLevelColon(param);
    const separator = i < paramList.length - 1 ? ', ' : '';
    if (colonIdx === -1) {
      return (
        <span key={i}>
          {renderType(param)}
          {separator}
        </span>
      );
    }
    const name = param.slice(0, colonIdx);
    const type = param.slice(colonIdx + 2);
    return (
      <span key={i}>
        <span style={{ color: GRAY }}>{name}: </span>
        {renderType(type)}
        {separator}
      </span>
    );
  });
}

/**
 * Render params on multiple indented lines:
 *   function name(
 *     param1: Type,
 *     param2: Type
 *   )
 */
function renderMultilineParams(params: string): ReactNode {
  const paramList = splitAtTopLevel(params, ', ');
  return (
    <>
      {'(\n'}
      {paramList.map((param, i) => {
        const colonIdx = findTopLevelColon(param);
        const separator = i < paramList.length - 1 ? ',' : '';
        return (
          <span key={i}>
            {'  '}
            {colonIdx === -1 ? (
              renderType(param)
            ) : (
              <>
                <span style={{ color: GRAY }}>{param.slice(0, colonIdx)}: </span>
                {renderType(param.slice(colonIdx + 2))}
              </>
            )}
            {separator}
            {'\n'}
          </span>
        );
      })}
      {')'}
    </>
  );
}

/**
 * Renders a generic signature line.
 *
 * Usage:
 *   <Sig name="string" returnType={<em style={{ color: "#267f99" }}>Decoder&lt;string&gt;</em>} source="strings.ts#L20-L25" />
 */
export function Sig({
  name,
  params,
  returnType,
  source,
  multiline,
}: {
  name: string;
  params?: string;
  returnType: ReactNode;
  source?: string;
  multiline?: boolean;
}) {
  return (
    <pre className="fn-sig font-mono" style={{ margin: 0, background: 'none', border: 'none', padding: 0 }}>
      {params !== undefined ? (
        name.includes('.') ? (
          <span className="font-sans" style={{ color: GRAY }}>
            Method{' '}
          </span>
        ) : (
          <span style={{ color: GRAY }}>function </span>
        )
      ) : null}
      <strong style={{ fontWeight: 700 }}>{name}</strong>
      {params !== undefined ? (
        multiline ? (
          renderMultilineParams(params)
        ) : (
          <>
            {'(\u200A'}
            {renderParams(params)}
            {'\u200A)'}
          </>
        )
      ) : null}
      {': '}
      {returnType}
      {source ? (
        <>
          {' '}
          <a href={`${REPO}/${source}`} title="Source" className="sig-source">
            (source)
          </a>
        </>
      ) : null}
    </pre>
  );
}

/**
 * Shorthand for decoder signatures — wraps `type` in `Decoder<...>`.
 *
 * Usage:
 *   <DecoderSig name="string" type="string" source="strings.ts#L20-L25" />
 *   <DecoderSig name="regex" params="pattern: RegExp, message: string" type="string" source="strings.ts#L32-L37" />
 *   <DecoderSig name="isoDate" aliases={[{ name: "iso8601", info: "Renamed to isoDate." }]} type="Date" />
 */

interface Alias {
  name: string;
  info?: ReactNode;
  deprecated: boolean;
}

function renderDecoderReturnType(type: string): ReactNode {
  return (
    <span>
      <span style={{ color: GRAY }}>{'Decoder<'}</span>
      <span style={{ color: TEAL }}>{type}</span>
      <span style={{ color: GRAY }}>{'>'}</span>
    </span>
  );
}

export function DecoderSig({
  name,
  aliases,
  params,
  type,
  source,
  multiline,
}: {
  name: string;
  aliases?: Alias[];
  params?: string;
  type: string;
  source?: string;
  multiline?: boolean;
}) {
  return (
    <>
      <Sig
        name={name}
        params={params}
        multiline={multiline}
        returnType={renderDecoderReturnType(type)}
        source={source}
      />
      {aliases?.map((alias) => (
        <pre
          key={alias.name}
          className={`fn-sig font-mono${alias.deprecated ? ' fn-sig-deprecated' : ''}`}
          style={{ margin: 0, background: 'none', border: 'none', padding: 0 }}
        >
          <span className={alias.deprecated ? 'fn-sig-content' : undefined}>
            <strong style={{ fontWeight: 700 }}>{alias.name}</strong>
            {params !== undefined ? (
              multiline ? (
                renderMultilineParams(params)
              ) : (
                <>
                  {'(\u200A'}
                  {renderParams(params)}
                  {'\u200A)'}
                </>
              )
            ) : null}
            {': '}
            {renderDecoderReturnType(type)}{' '}
            <span className="fn-sig-badge">
              {alias.deprecated ? 'deprecated' : 'alias'}
            </span>
          </span>
          {alias.info && <Info>{alias.info}</Info>}
        </pre>
      ))}
    </>
  );
}
