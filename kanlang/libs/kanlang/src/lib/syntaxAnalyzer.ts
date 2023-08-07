import { AbstractSyntaxTree } from './ast';
import { Token } from './tokenizer';

export class SyntaxAnalyzer {
  constructor(private tokens: Token[]) {}

  analyze(): AbstractSyntaxTree {
    return {
      node: {},
      children: [],
      tokens: this.tokens,
    };
  }
}
