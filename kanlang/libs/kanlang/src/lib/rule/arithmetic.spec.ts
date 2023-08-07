import { Tokenizer } from '../tokenizer';
import { Arithmetic } from '.';
import { AbstractSyntaxTree } from '../ast';
const tokenizer = new Tokenizer();

describe('arithmetic', () => {
  it('parses simple additions', () =>
    expect(new Arithmetic().consume(tokenizer.tokenize('1+2'))).toEqual({
      children: [
        {
          token: {
            value: '1',
            type: 'number',
            start: 0,
            end: 1,
          },
          children: [],
        },
        {
          token: {
            value: '2',
            type: 'number',
            start: 2,
            end: 3,
          },
          children: [],
        },
      ],
      token: {
        value: '+',
        type: 'operator',
        start: 1,
        end: 2,
      },
    } as AbstractSyntaxTree));
});
