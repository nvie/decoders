import { assertNever, isPlainObject, isPromiseLike } from '~/lib/utils';

const kAnnotationRegistry = Symbol.for('decoders.kAnnotationRegistry');
// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
const _stamped: WeakSet<Annotation> = ((globalThis as any)[kAnnotationRegistry] ??=
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
  ObjectAnnotation | ArrayAnnotation | ScalarAnnotation | OpaqueAnnotation;

/** @internal */
function stamp<A extends Annotation>(ann: A): A {
  _stamped.add(ann);
  return ann;
}

/**
 * @internal
 * Creates an ObjectAnnotation whose fields are only computed when first read.
 */
export function makeObjectAnn(
  getFields: () => ReadonlyMap<string, Annotation>,
  text?: string,
): ObjectAnnotation {
  let fields: ReadonlyMap<string, Annotation> | undefined;
  return stamp({
    type: 'object',
    get fields() {
      return (fields ??= getFields());
    },
    text,
  });
}

/**
 * @internal
 * Creates an ArrayAnnotation whose items are only computed when first read.
 */
export function makeArrayAnn(
  getItems: () => readonly Annotation[],
  text?: string,
): ArrayAnnotation {
  let items: readonly Annotation[] | undefined;
  return stamp({
    type: 'array',
    get items() {
      return (items ??= getItems());
    },
    text,
  });
}

/** @internal */
export function makeOpaqueAnn(value: string, text?: string): OpaqueAnnotation {
  return stamp({ type: 'opaque', value, text });
}

/** @internal */
export function makeScalarAnn(value: unknown, text?: string): ScalarAnnotation {
  return stamp({ type: 'scalar', value, text });
}

/**
 * @internal
 * Given an existing Annotation, set the annotation's text to a new value.
 * Does not force the evaluation of lazy fields or items.
 */
export function updateText(annotation: ObjectAnnotation, text?: string): ObjectAnnotation;
export function updateText(annotation: Annotation, text?: string): Annotation;
export function updateText(annotation: Annotation, text?: string): Annotation {
  if (text === undefined) {
    return annotation;
  }

  switch (annotation.type) {
    case 'object':
      return makeObjectAnn(() => annotation.fields, text);
    case 'array':
      return makeArrayAnn(() => annotation.items, text);
    case 'scalar':
      return makeScalarAnn(annotation.value, text);
    case 'opaque':
      return makeOpaqueAnn(annotation.value, text);

    // istanbul ignore next -- @preserve
    default:
      return assertNever(annotation, 'Unknown annotation type');
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
  return makeObjectAnn(
    () => new Map([...objAnnotation.fields, ...fields]),
    objAnnotation.text,
  );
}

/** @internal */
export function isAnnotation(thing: unknown): thing is Annotation {
  return _stamped.has(thing as Annotation);
}

type RefSet = WeakSet<object>;

/** @internal */
function annotateArray(
  arr: readonly unknown[],
  text: string | undefined,
  seen: RefSet,
): ArrayAnnotation | OpaqueAnnotation {
  seen.add(arr);

  // Not arr.map(), which would skip the holes in sparse arrays like [1, , 3]
  return makeArrayAnn(
    () => Array.from(arr, (value) => __annotate(value, undefined, seen)),
    text,
  );
}

/** @internal */
function annotateObject(
  obj: Readonly<Record<string, unknown>>,
  text: string | undefined,
  seen: RefSet,
): ObjectAnnotation {
  seen.add(obj);

  return makeObjectAnn(() => {
    const fields = new Map<string, Annotation>();
    for (const key of Object.keys(obj)) {
      const value = obj[key];
      fields.set(key, __annotate(value, undefined, seen));
    }
    return fields;
  }, text);
}

/** @internal */
export function __annotate(
  value: unknown,
  text: string | undefined,
  seen: RefSet,
): Annotation {
  if (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'symbol' ||
    typeof value === 'bigint' ||
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

  if (isPlainObject(value)) {
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

  if (isPromiseLike(value)) {
    return makeOpaqueAnn('<Promise>', text);
  }

  // istanbul ignore else -- @preserve
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (value?.constructor?.name) {
    return makeOpaqueAnn(`<${value.constructor.name}>`, text);
  } else {
    return makeOpaqueAnn('???', text);
  }
}

function public_annotate(value: unknown, text?: string): Annotation {
  return __annotate(value, text, new WeakSet());
}

function public_annotateObject(
  obj: Readonly<Record<string, unknown>>,
  text?: string,
): ObjectAnnotation {
  return annotateObject(obj, text, new WeakSet());
}

export {
  // This construct just ensures the "seen" weakmap (used for circular
  // reference detection) isn't made part of the public API.
  public_annotate as annotate,
  public_annotateObject as annotateObject,
};
