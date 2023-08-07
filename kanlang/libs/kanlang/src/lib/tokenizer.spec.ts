import { Tokenizer } from './tokenizer';
describe('tokenizer', () => {
  const tokenizer = new Tokenizer();

  describe('tokenize', () => {
    it('throws on undefined', () =>
      expect(() => tokenizer.tokenize(undefined)).toThrow());
    it('returns empty array on empty string', () =>
      expect(tokenizer.tokenize('')).toEqual([]));

    describe('numbers', () => {
      it('unsigned', () =>
        expect(tokenizer.tokenize('5345')).toEqual([
          {
            value: '5345',
            type: 'number',
            start: 0,
            end: 4,
          },
        ]));
      it('decimal', () =>
        expect(tokenizer.tokenize('42.35')).toEqual([
          {
            value: '42.35',
            type: 'number',
            start: 0,
            end: 5,
          },
        ]));
    });

    it('tokenizes single "if" keyword token', () =>
      expect(tokenizer.tokenize('if')).toEqual([
        {
          value: 'if',
          type: 'keyword',
          start: 0,
          end: 2,
        },
      ]));
    it('tokenizes a chain of tokens correctly', () =>
      expect(tokenizer.tokenize(`if "some string"`)).toEqual([
        {
          value: 'if',
          type: 'keyword',
          start: 0,
          end: 2,
        },
        {
          value: ' ',
          type: 'whitespace',
          start: 2,
          end: 3,
        },
        {
          value: '"some string"',
          type: 'literal',
          start: 3,
          end: 16,
        },
      ]));
    it("throws on tokens that can't be parsed", () =>
      expect(() => tokenizer.tokenize('qwerty')).toThrow());
  });
});
