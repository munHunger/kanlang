import { Tokenizer } from '../tokenizer';
import { Arithmetic } from '.';
const tokenizer = new Tokenizer();

describe('arithmetic', () => {
  it('parses simple additions into an AST', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1+2')).toAstString()
    ).toEqual('+(1, 2)'));
  it('parses simple additions into a parse tree', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1+2')).toParseTreeString()
    ).toEqual('Arithmetic:+(1, 2)'));

  it('parses arithmetic chains', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1+2+3')).toAstString()
    ).toEqual('+(1, +(2, 3))'));
  it('Handles arithmetic ordering', () =>
    expect(
      new Arithmetic().consume(tokenizer.tokenize('1-2+3/2*4')).toAstString()
    ).toEqual('*(4, /(2, +(3, -(1, 2))))'));
});
