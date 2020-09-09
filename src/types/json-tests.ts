import { json, jsonObject, jsonArray } from 'decoders';

// $ExpectType JSONValue
json('hi').unwrap();

// $ExpectType JSONObject
jsonObject({}).unwrap();

// $ExpectType JSONArray
jsonArray([]).unwrap();
