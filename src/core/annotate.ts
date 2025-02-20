import { isPojo } from '~/lib/utils.js';

const kAnnotationRegistry = Symbol.for('decoders.kAnnotationRegistry');
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const _register: WeakSet<Annotation> = ((globalThis as any)[kAnnotationRegistry] ??=
  new WeakSet());

export interface ObjectAnnotation {
  readonly type: 'object';
  readonly fields: ReadonlyMap<string, Annotation>;
  readonly text?: string;
}

export interface ArrayAnnotation {
  readonly type: 'array';
  readonly items: readonly Annotation[];
  readonly text?: string;
}

export interface ScalarAnnotation {
  readonly type: 'scalar';
  readonly value: unknown;
  readonly text?: string;
}

export interface OpaqueAnnotation {
  readonly type: 'opaque';
  readonly value: string; // e.g. '???' | '<function>' | '<circular ref>'
  readonly text?: string;
}

export type Annotation =
  | ObjectAnnotation
  | ArrayAnnotation
  | ScalarAnnotation
  | OpaqueAnnotation;

/** @internal */
function brand<A extends Annotation>(ann: A): A {
  _register.add(ann);
  return ann;
}

/** @internal */
export function makeObjectAnn(
  fields: ReadonlyMap<string, Annotation>,
  text?: string,
): ObjectAnnotation {
  return brand({ type: 'object', fields, text });
}

/** @internal */
export function makeArrayAnn(
  items: readonly Annotation[],
  text?: string,
): ArrayAnnotation {
  return brand({ type: 'array', items, text });
}

/** @internal */
export function makeOpaqueAnn(value: string, text?: string): OpaqueAnnotation {
  return brand({ type: 'opaque', value, text });
}

/** @internal */
export function makeScalarAnn(value: unknown, text?: string): ScalarAnnotation {
  return brand({ type: 'scalar', value, text });
}

/**
 * @internal
 * Given an existing Annotation, set the annotation's text to a new value.
 */
export function updateText<A extends Annotation>(annotation: A, text?: string): A {
  if (text !== undefined) {
    return brand({ ...annotation, text });
  } else {
    return annotation;
  }
}

/**
 * @internal
 * Given an existing ObjectAnnotation, merges new Annotations in there.
 */
export function merge(
  objAnnotation: ObjectAnnotation,
  fields: ReadonlyMap<string, Annotation>,
): ObjectAnnotation {
  const newFields = new Map([...objAnnotation.fields, ...fields]);
  return makeObjectAnn(newFields, objAnnotation.text);
}

/** @internal */
export function isAnnotation(thing: unknown): thing is Annotation {
  return _register.has(thing as Annotation);
}

type RefSet = WeakSet<object>;

/** @internal */
function annotateArray(
  arr: readonly unknown[],
  text: string | undefined,
  seen: RefSet,
): ArrayAnnotation | OpaqueAnnotation {
  seen.add(arr);

  // Cannot use .map() here because it won't work correctly if `arr` is
  // a sparse array.
  const items = [];
  for (const value of arr) {
    items.push(annotate(value, undefined, seen));
  }
  return makeArrayAnn(items, text);
}

/** @internal */
function annotateObject(
  obj: Readonly<Record<string, unknown>>,
  text: string | undefined,
  seen: RefSet,
): ObjectAnnotation {
  seen.add(obj);

  const fields = new Map<string, Annotation>();
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    fields.set(key, annotate(value, undefined, seen));
  }
  return makeObjectAnn(fields, text);
}

/** @internal */
function annotate(value: unknown, text: string | undefined, seen: RefSet): Annotation {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof (value as Record<string, unknown>).getMonth === 'function'
  ) {
    return makeScalarAnn(value, text);
  }

  if (isAnnotation(value)) {
    return updateText(value, text);
  }

  if (Array.isArray(value)) {
    // "Circular references" can only exist in objects or arrays
    if (seen.has(value)) {
      return makeOpaqueAnn('<circular ref>', text);
    } else {
      return annotateArray(value, text, seen);
    }
  }

  if (isPojo(value)) {
    // "Circular references" can only exist in objects or arrays
    if (seen.has(value)) {
      return makeOpaqueAnn('<circular ref>', text);
    } else {
      return annotateObject(value, text, seen);
    }
  }

  if (typeof value === 'function') {
    return makeOpaqueAnn('<function>', text);
  }

  return makeOpaqueAnn('???', text);
}

function public_annotate(value: unknown, text?: string): Annotation {
  return annotate(value, text, new WeakSet());
}

function public_annotateObject(
  obj: Readonly<Record<string, unknown>>,
  text?: string,
): ObjectAnnotation {
  return annotateObject(obj, text, new WeakSet());
}

export {
  /** @internal */
  annotate as __private_annotate,
  // This construct just ensures the "seen" weakmap (used for circular
  // reference detection) isn't made part of the public API.
  public_annotate as annotate,
  public_annotateObject as annotateObject,
};
