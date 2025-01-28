import { string } from '../dist';
import { expectAssignable, expectError, expectType } from 'tsd';
import type { StandardSchemaV1 } from '@standard-schema/spec';

expectAssignable<StandardSchemaV1>(string);
expectAssignable<StandardSchemaV1<unknown>>(string);
expectAssignable<StandardSchemaV1<unknown, string>>(string);

const stringToNumber = string.transform((x) => x.length);

const input = {} as StandardSchemaV1.InferInput<typeof stringToNumber>;
expectType<unknown>(input);

const output = {} as StandardSchemaV1.InferOutput<typeof stringToNumber>;
expectType<number>(output);

// A generic function that accepts an arbitrary spec-compliant validator
declare function standardValidate<T extends StandardSchemaV1>(
  schema: T,
  input: StandardSchemaV1.InferInput<T>,
): StandardSchemaV1.InferOutput<T>;

// `string` and `stringToNumber` are accepted by `standardValidate`
expectError(standardValidate(() => "I'm a string", 42));
expectType<string>(standardValidate(string, "I'm a string"));
expectType<number>(standardValidate(stringToNumber, "I'm a string"));
