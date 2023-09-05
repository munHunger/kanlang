import { EarleyParser } from './lib/earley';
import { Tokenizer } from './lib/tokenizer';
import * as rules from './lib/rule';
import { SemanticAnalyzer } from './lib/semantic';
import { CodeGenerator } from './lib/codeGen';
import { ParseTree } from './lib/parseTree';

export * from './lib/tokenizer';

const tokenizer = new Tokenizer();
const parser = new EarleyParser(new rules.Main());
const semantics = new SemanticAnalyzer();
const codeGen = new CodeGenerator();

export function compile(input: string) {
  ParseTree.errors = [];
  const tokens = tokenizer.tokenize(input);
  const state = parser.parse(tokens);
  const sem = semantics.analyze(state);
  const out = codeGen.generate(sem, true);
  return { tokens, sem, out };
}
