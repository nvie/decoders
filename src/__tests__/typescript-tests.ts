import {
    array,
    boolean,
    compose,
    constant,
    date,
    dict,
    dispatch,
    either,
    either3,
    either4,
    email,
    exact,
    fail,
    guard,
    hardcoded,
    integer,
    map,
    mapping,
    maybe,
    mixed,
    null_,
    nullable,
    number,
    numericBoolean,
    object,
    optional,
    poja,
    pojo,
    positiveInteger,
    positiveNumber,
    predicate,
    regex,
    string,
    truthy,
    tuple4,
    tuple6,
    undefined_,
    field,
    unknown,
    url,
} from '..';

const rect = object({ type: constant('rect') });
const circle = object({ type: constant('circle') });
const shape = dispatch(field('type', string), type => {
    switch (type) {
        case 'rect':
            return rect;
        case 'circle':
            return circle;
    }
    return fail('Must be a valid shape');
});

guard(
    object({
        a0: string,
        a1: number,
        a2: optional(nullable(either4(string, email, regex(/x/, 'Must be x'), url()))),
        a3: fail('foo'),
        a4: maybe(mixed),
        a5: either3(constant('foo'), constant('bar'), constant('qux')),
        a6: exact({ c: array(poja), d: pojo }),
        a7: tuple6(hardcoded('foo'), mixed, null_, undefined_, unknown, truthy),
        a8: tuple4(integer, number, positiveInteger, positiveNumber),
        a9: either(boolean, numericBoolean),
        b0: map(
            compose(
                string,
                predicate(s => s.startsWith('x'), 'Must start with x')
            ),
            s => s.toUpperCase()
        ),
        b1: shape,
        b2: date,
        b3: dict(string),
        b4: mapping(string),
    }),
    { style: 'simple' }
)('blah');
