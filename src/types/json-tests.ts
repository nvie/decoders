import { json, jsonObject, jsonArray } from 'decoders';
import * as Result from 'decoders/core/Result';

// $ExpectType JSONValue
Result.unwrap(json('hi'));

// $ExpectType JSONObject
Result.unwrap(jsonObject({}));

// $ExpectType JSONArray
Result.unwrap(jsonArray([]));
