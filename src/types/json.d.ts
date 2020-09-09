import { Decoder } from './types';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = Array<JSONValue>;

export function json: Decoder<JSONValue>;
export function jsonArray: Decoder<JSONArray>;
export function jsonObject: Decoder<JSONObject>;
