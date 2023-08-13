import { EarleyParser } from './lib/earley';
import { Tokenizer } from './lib/tokenizer';
import * as rules from './lib/rule';
import { SemanticAnalyzer, SemanticState } from './lib/semantic';

export * from './lib/tokenizer';

const tokenizer = new Tokenizer();
const parser = new EarleyParser();
const semantics = new SemanticAnalyzer();
Object.values(rules).map((rule) => parser.registerRule(new rule()));
export function compile(input: string) {
  const tokens = tokenizer.tokenize(input);
  const state = parser.parse(tokens);
  const sem = semantics.analyze(state);
  return { tokens, sem };
}
