import { Decoder } from './types';

export type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
export interface JSONObject {
    [key: string]: JSONValue;
}
export type JSONArray = JSONValue[];

export const json: Decoder<JSONValue>;
export const jsonArray: Decoder<JSONArray>;
export const jsonObject: Decoder<JSONObject>;
