import type { Decoder } from '~/core/index.js';

import { array } from './arrays.js';
import { null_ } from './basics.js';
import { boolean } from './booleans.js';
import { record } from './collections.js';
import { lazy } from './misc.js';
import { number } from './numbers.js';
import { string } from './strings.js';
import { either } from './unions.js';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue | undefined };
export type JSONArray = JSONValue[];

/**
 * Accepts objects that contain only valid JSON values.
 */
export const jsonObject: Decoder<JSONObject> = lazy(() => record(json));

/**
 * Accepts arrays that contain only valid JSON values.
 */
export const jsonArray: Decoder<JSONArray> = lazy(() => array(json));

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
export const json: Decoder<JSONValue> = either(
  null_,
  string,
  number,
  boolean,
  jsonObject,
  jsonArray,
).describe('Must be valid JSON value');
