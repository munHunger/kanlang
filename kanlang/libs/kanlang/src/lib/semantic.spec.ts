import { EarleyParser } from './earley';
import * as rules from './rule';
import { SemanticAnalyzer } from './semantic';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

const parser = new EarleyParser();
Object.values(rules).map((rule) => parser.registerRule(new rule()));

const semantic = new SemanticAnalyzer();

describe('semantics', () => {
  it('does declares data in the scope', () => {
    const tree = semantic.analyze(
      parser.parse(tokenizer.tokenize('let a = 1 + 2'))
    );
    expect(tree.scope.a.variable.type).toEqual('num');
  });
});
