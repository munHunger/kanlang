import { EarleyParser } from './earley';
import * as rules from './rule';
import { SemanticAnalyzer } from './semantic';
import { Tokenizer } from './tokenizer';
const tokenizer = new Tokenizer();

const parser = new EarleyParser(new rules.Body());

const semantic = new SemanticAnalyzer();

describe('semantics', () => {
  it('does declares data in the scope', () => {
    const tree = semantic.analyze(
      parser.parse(tokenizer.tokenize('let a = 1 * 2'))
    );
    expect(tree.scope.a.variable.type).toEqual('num');
  });
  it('does stuff', () => {
    const tree = semantic.analyze(
      parser.parse(tokenizer.tokenize('let a = b * 2'))
    );
    expect(tree.scope.a.variable.type).toEqual('num');
  });
  it('handles multiple variables', () => {
    const tree = semantic.analyze(
      parser.parse(tokenizer.tokenize('let a = 1; let b = true;'))
    );
    expect(tree.scope.a.variable.type).toEqual('num');
    expect(tree.scope.b.variable.type).toEqual('boolean');
  });
});
