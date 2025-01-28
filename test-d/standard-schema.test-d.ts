import { string } from '../dist';
import { expectAssignable, expectType } from 'tsd';
import type { StandardSchemaV1 } from '@standard-schema/spec';

expectAssignable<StandardSchemaV1>(string);
expectAssignable<StandardSchemaV1<unknown>>(string);
expectAssignable<StandardSchemaV1<unknown, string>>(string);

const stringToNumber = string.transform((x) => x.length);

const input = {} as StandardSchemaV1.InferInput<typeof stringToNumber>;
expectType<unknown>(input);

const output = {} as StandardSchemaV1.InferOutput<typeof stringToNumber>;
expectType<number>(output);
