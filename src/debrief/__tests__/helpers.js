// @flow strict

const whitespace_re = /^\s*$/;

export function dedent(value: string): string {
    let lines = value.split('\n');
    if (lines.length > 0 && whitespace_re.test(lines[0])) {
        lines.shift();
    }
    if (lines.length > 0 && whitespace_re.test(lines[lines.length - 1])) {
        lines.pop();
    }
    const level = Math.min(...lines.filter((s) => !!s).map((s) => s.search(/\S/)));
    const dedented = lines.map((value) => (value ? value.substring(level) : ''));
    return dedented.join('\n');
}

describe('dedent', () => {
    it('works', () => {
        expect(dedent('foo\nbar')).toEqual('foo\nbar');
        expect(dedent('foo\n    bar')).toEqual('foo\n    bar');
        expect(dedent('  foo\n    bar')).toEqual('foo\n  bar');
        expect(dedent('\n  foo\n\n    bar')).toEqual('foo\n\n  bar');

        const snippet = `
          [
            1234,
            true,
          ]
        `;
        expect(dedent(snippet)).toEqual('[\n  1234,\n  true,\n]');
    });
});
