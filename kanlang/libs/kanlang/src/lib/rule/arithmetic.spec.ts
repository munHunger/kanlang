import { Tokenizer } from '../tokenizer';
import { Arithmetic } from '.';
import { AbstractSyntaxTree } from '../ast';
const tokenizer = new Tokenizer();

describe('arithmetic', () => {
  it('parses simple additions', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1+2')).toString()
    ).toEqual('+(1, 2)'));

  it('parses arithmetic chains', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1+2+3')).toString()
    ).toEqual('+(1, +(2, 3))'));
});
