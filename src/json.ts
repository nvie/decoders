import type { ReadonlyDecoder } from '~/core';

import { array } from './arrays';
import { null_ } from './basics';
import { boolean } from './booleans';
import { record } from './collections';
import { lazy } from './misc';
import { number } from './numbers';
import { string } from './strings';
import { either } from './unions';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue | undefined };
export type JSONArray = JSONValue[];

/**
 * Accepts objects that contain only valid JSON values.
 */
export const jsonObject: ReadonlyDecoder<JSONObject> = lazy(() => record(json), {
  readonly: true,
});

/**
 * Accepts arrays that contain only valid JSON values.
 */
export const jsonArray: ReadonlyDecoder<JSONArray> = lazy(() => array(json), {
  readonly: true,
});

/**
 * Accepts any value that's a valid JSON value.
 *
 * In other words: any value returned by `JSON.parse()` should decode without
 * failure.
 *
 * ```typescript
 * type JSONValue =
 *     | null
 *     | string
 *     | number
 *     | boolean
 *     | { [string]: JSONValue }
 *     | JSONValue[]
 * ```
 */
export const json: ReadonlyDecoder<JSONValue> = /* #__PURE__ */ either(
  null_,
  string,
  number,
  boolean,
  jsonObject,
  jsonArray,
).describe('Must be valid JSON value');
