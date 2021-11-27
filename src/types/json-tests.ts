import { json, jsonObject, jsonArray } from 'decoders';
import * as Result from 'decoders/result';

// $ExpectType JSONValue
Result.unwrap(json('hi'));

// $ExpectType JSONObject
Result.unwrap(jsonObject({}));

// $ExpectType JSONArray
Result.unwrap(jsonArray([]));
