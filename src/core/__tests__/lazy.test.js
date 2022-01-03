// @flow strict
/* eslint-disable no-restricted-syntax */

import { array } from '../arrays';
import { INPUTS } from './fixtures';
import { lazy } from '../lazy';
import { number } from '../numbers';
import { object } from '../objects';
import { optional } from '../optional';
import { string } from '../strings';
import type { Decoder } from '../../_decoder';

describe('lazy', () => {
    it('lazy(() => string) is same as string', () => {
        const eagerDecoder = string;
        const lazyDecoder = lazy(() => string);
        for (const input of INPUTS) {
            const eagerResult = eagerDecoder.decode(input);
            const lazyResult = lazyDecoder.decode(input);
            expect(eagerResult.value).toEqual(lazyResult.value);
            expect(eagerResult.error).toEqual(lazyResult.error);
        }
    });

    it('build self-referential types with lazy()', () => {
        type StringList = {|
            curr: string,
            next?: StringList,
        |};

        const llist: Decoder<StringList> = object({
            curr: string,
            next: optional(lazy(() => llist)),
        });

        expect(llist.decode(123).ok).toBe(false);
        expect(llist.decode('string').ok).toBe(false);
        expect(llist.decode({ curr: 123 }).ok).toBe(false);
        expect(llist.decode({ curr: 'string', next: true }).ok).toBe(false);

        const v1 = { curr: 'i am a string' };
        const v2 = { curr: 'i am a string', next: { curr: 'another' } };
        expect(llist.decode(v1).value).toEqual(v1);
        expect(llist.decode(v2).value).toEqual(v2);
    });

    it('build self-referential types with variables', () => {
        type Tree<T> = {|
            node: T,
            children: Array<Tree<T>>,
        |};

        function tree<T>(decoder: Decoder<T>): Decoder<Tree<T>> {
            return object({
                node: decoder,
                children: array(lazy(() => tree(decoder))),
            });
        }

        const stringTree = tree(string);

        expect(stringTree.decode(123).ok).toBe(false);
        expect(stringTree.decode('string').ok).toBe(false);
        expect(stringTree.decode({ node: 123 }).ok).toBe(false);
        expect(stringTree.decode({ node: 'string', children: false }).ok).toBe(false);

        const s1 = { node: 'string', children: [] };
        const s2 = { node: 'string', children: [{ node: 'another', children: [] }] };
        expect(stringTree.decode(s1).value).toEqual(s1);
        expect(stringTree.decode(s2).value).toEqual(s2);

        const n1 = { node: 123, children: [] };
        const n2 = { node: 123, children: [{ node: 456, children: [] }] };
        expect(tree(number).decode(n1).value).toEqual(n1);
        expect(tree(number).decode(n2).value).toEqual(n2);
    });
});
