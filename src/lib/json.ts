// @flow strict

import { array } from './arrays';
import { boolean } from './booleans';
import { dict } from './objects';
import { either } from './unions';
import { lazy } from './utilities';
import { null_ } from './basics';
import { number } from './numbers';
import { string } from './strings';
import type { Decoder } from '../Decoder';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export type JSONObject = { [string]: JSONValue };
export type JSONArray = Array<JSONValue>;

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
