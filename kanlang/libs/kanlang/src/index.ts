import { EarleyParser } from './lib/earley';
import { Tokenizer } from './lib/tokenizer';
import * as rules from './lib/rule';

export * from './lib/tokenizer';

const tokenizer = new Tokenizer();
const parser = new EarleyParser();
Object.values(rules).map((rule) => parser.registerRule(new rule()));
export function compile(input: string) {
  const tokens = tokenizer.tokenize(input);
  const state = parser.parse(tokens);
}
