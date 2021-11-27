import { json, jsonObject, jsonArray } from 'decoders';
import * as Result from 'decoders/lib/Result';

// $ExpectType JSONValue
Result.unwrap(json('hi'));

// $ExpectType JSONObject
Result.unwrap(jsonObject({}));

// $ExpectType JSONArray
Result.unwrap(jsonArray([]));
