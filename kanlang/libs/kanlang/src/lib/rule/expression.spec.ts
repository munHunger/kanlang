import { Tokenizer } from '../tokenizer';
import { EarleyParser } from '../earley';
import * as rules from '.';
const tokenizer = new Tokenizer();

describe('expression', () => {
  const parser = new EarleyParser();
  Object.values(rules).map((rule) => parser.registerRule(new rule()));
  it('parses math as an expression', () =>
    expect(
      (parser.parse(tokenizer.tokenize('1+2+3+4+5')) as any).toAstString()
    ).toEqual('+(1, 2)'));
});
