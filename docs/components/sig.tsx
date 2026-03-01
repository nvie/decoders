const REPO = "https://github.com/nvie/decoders/tree/main/src";

/**
 * Renders a generic signature line.
 *
 * Usage:
 *   <Sig name="string" returnType="Decoder<string>" source="strings.ts#L20-L25" />
 */
export function Sig({
  name,
  params,
  returnType,
  source,
}: {
  name: string;
  params?: string;
  returnType: string;
  source?: string;
}) {
  return (
    <p className="fn-sig">
      <strong>{name}</strong>
      {params !== undefined ? (
        <>
          (<span style={{ color: "#267f99" }}>{params}</span>)
        </>
      ) : null}
      {": "}
      <em style={{ color: "#267f99" }}>{returnType}</em>
      {source ? (
        <>
          {" "}
          <a
            href={`${REPO}/${source}`}
            title="Source"
            style={{ fontSize: "0.85em" }}
          >
            (source)
          </a>
        </>
      ) : null}
    </p>
  );
}

/**
 * Shorthand for decoder signatures — wraps `type` in `Decoder<...>`.
 *
 * Usage:
 *   <DecoderSig name="string" type="string" source="strings.ts#L20-L25" />
 *   <DecoderSig name="regex" params="pattern: RegExp, message: string" type="string" source="strings.ts#L32-L37" />
 */
export function DecoderSig({
  name,
  params,
  type,
  source,
}: {
  name: string;
  params?: string;
  type: string;
  source?: string;
}) {
  return (
    <Sig
      name={name}
      params={params}
      returnType={`Decoder<${type}>`}
      source={source}
    />
  );
}
