import { Decoder } from '../Decoder';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export interface JSONObject {
    [key: string]: JSONValue | undefined;
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
 * Accepts arrays that contain only valid JSON values.
 */
export const jsonArray: Decoder<JSONArray>;

/**
 * Accepts objects that contain only valid JSON values.
 */
export const jsonObject: Decoder<JSONObject>;
