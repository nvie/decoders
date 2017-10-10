// @flow

// import { andThen } from '../andThen';
// import { decodeConstant } from '../constants';
// import { decodeNumber } from '../number';
// import { decodeObject } from '../object';
// import { decodeString } from '../string';
// import type { Decoder } from '../types';

// type Geo = { type: string };
// type Rect = { type: 'rect', x: number, y: number, width: number, height: number };
// type Circle = { type: 'circle', x: number, y: number, r: number };

// const geoDecoder = decodeObject({ type: decodeString() });
// const rectDecoder = decodeObject({
//     type: decodeConstant('rect'),
//     x: decodeNumber(),
//     y: decodeNumber(),
//     width: decodeNumber(),
//     height: decodeNumber(),
// });
// const circleDecoder = decodeObject({
//     type: decodeConstant('circle'),
//     x: decodeNumber(),
//     y: decodeNumber(),
//     r: decodeNumber(),
// });

describe('andThen', () => {
    // The "deciderer" ;) effectively dispatches the real decoding to
    // a specific decoder, after detecting the value of the type field.
    // const deciderer = (geo: Decoder<Geo>): Decoder<Rect> | Decoder<Circle> => {
    //     // Probe the geo instance, which is now guaranteed to have the field
    //     // "type".
    //     if (geo.type === 'rect') {
    //         return rectDecoder;
    //     } else if (geo.type === 'circle') {
    //         return circleDecoder;
    //     } else {
    //         throw new Error('Unrecognized geo shape type');
    //     }
    // };
    // const decoder = andThen(deciderer, geoDecoder);

    it('allows conditional decoding', () => {
        // expect(decoder({ type: 'circle', x: 3, y: 5 })).toEqual({ type: 'circle', x: 3, y: 5 });
    });
});
