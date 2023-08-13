import { EarleyParser } from './earley';
import { Rule } from './rule/rule';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

export function testAST(
  message: string,
  startingRule: Rule,
  input: string,
  expected: string
) {
  const parser = new EarleyParser(startingRule);
  it(message + ':' + input, () =>
    expect(parser.parse(tokenizer.tokenize(input)).toAstString()).toEqual(
      expected
    )
  );
}
