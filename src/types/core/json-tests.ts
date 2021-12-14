import { json, jsonObject, jsonArray } from 'decoders';
import { unwrap } from 'decoders/result';

// $ExpectType JSONValue
unwrap(json('hi'));

// $ExpectType JSONObject
unwrap(jsonObject({}));

// $ExpectType JSONArray
unwrap(jsonArray([]));
