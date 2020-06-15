// @flow strict

import { array } from '../array';
import { lazy } from '../lazy';
import { number } from '../number';
import { object } from '../object';
import { optional } from '../optional';
import { string } from '../string';
import type { Decoder } from '../types';
import { INPUTS } from './fixtures';

describe('lazy', () => {
    it('lazy(() => string) is same as string', () => {
        const eagerDecoder = string;
        const lazyDecoder = lazy(() => string);
        for (const input of INPUTS) {
            const eagerResult = eagerDecoder(input);
            const lazyResult = lazyDecoder(input);
            expect(eagerResult.value()).toEqual(lazyResult.value());
            expect(eagerResult.errValue()).toEqual(lazyResult.errValue());
        }
    });

    it('build self-referential types with lazy()', () => {
        type StringList = {
            curr: string,
            next?: StringList,
        };

        const llist: Decoder<StringList> = object({
            curr: string,
            next: optional(lazy(() => llist)),
        });

        expect(llist(123).isErr()).toBe(true);
        expect(llist('string').isErr()).toBe(true);
        expect(llist({ curr: 123 }).isErr()).toBe(true);
        expect(llist({ curr: 'string', next: true }).isErr()).toBe(true);

        const v1 = { curr: 'i am a string' };
        const v2 = { curr: 'i am a string', next: { curr: 'another' } };
        expect(llist(v1).value()).toEqual(v1);
        expect(llist(v2).value()).toEqual(v2);
    });

    it('build self-referential types with variables', () => {
        type Tree<T> = {
            node: T,
            children: Array<Tree<T>>,
        };

        function tree<T>(decoder: Decoder<T>): Decoder<Tree<T>> {
            return object({
                node: decoder,
                children: array(lazy(() => tree(decoder))),
            });
        }

        const stringTree = tree(string);

        expect(stringTree(123).isErr()).toBe(true);
        expect(stringTree('string').isErr()).toBe(true);
        expect(stringTree({ node: 123 }).isErr()).toBe(true);
        expect(stringTree({ node: 'string', children: false }).isErr()).toBe(true);

        const s1 = { node: 'string', children: [] };
        const s2 = { node: 'string', children: [{ node: 'another', children: [] }] };
        expect(stringTree(s1).value()).toEqual(s1);
        expect(stringTree(s2).value()).toEqual(s2);

        const n1 = { node: 123, children: [] };
        const n2 = { node: 123, children: [{ node: 456, children: [] }] };
        expect(tree(number)(n1).value()).toEqual(n1);
        expect(tree(number)(n2).value()).toEqual(n2);
    });
});
