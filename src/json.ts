import type { Decoder } from '~/core';

import { array } from './arrays';
import { null_ } from './basics';
import { boolean } from './booleans';
import { lazy } from './misc';
import { number } from './numbers';
import { dict } from './objects';
import { string } from './strings';
import { either } from './unions';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue | undefined };
export type JSONArray = JSONValue[];

/**
 * Accepts objects that contain only valid JSON values.
 */
export const jsonObject: Decoder<JSONObject> = lazy(() => dict(json));

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
