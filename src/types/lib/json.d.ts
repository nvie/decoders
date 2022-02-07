import { Decoder } from '../Decoder';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export interface JSONObject {
    [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

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
export const json: Decoder<JSONValue>;

/**
 * Like `json`, but will only decode when the JSON value is an array.
 */
export const jsonArray: Decoder<JSONArray>;

/**
 * Like `json`, but will only decode when the JSON value is an object.
 */
export const jsonObject: Decoder<JSONObject>;
