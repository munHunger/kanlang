import { EarleyParser } from './earley';
import * as rules from './rule';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

const parser = new EarleyParser();
Object.values(rules).map((rule) => parser.registerRule(new rule()));

export function testAST(message: string, input: string, expected: string) {
  it(message + ':' + input, () =>
    expect(parser.parse(tokenizer.tokenize(input)).toAstString()).toEqual(
      expected
    )
  );
}
