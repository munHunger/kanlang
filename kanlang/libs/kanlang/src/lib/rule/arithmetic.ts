import { AbstractSyntaxTree } from '../ast';
import { Token, TokenType } from '../tokenizer';
import { Rule } from './rule';

export class Arithmetic extends Rule {
  get rules(): (TokenType | Rule)[][] {
    return [
      ['number', this],
      ['number', 'operator', 'number'],
    ];
  }

  consume(tokens: Token[]): AbstractSyntaxTree | undefined {
    if (tokens.length < 3) return null;
    if (tokens[1].type !== 'operator') return null;
    if (tokens[0].type !== 'number' || tokens[2].type !== 'number') return null;
    const left = new AbstractSyntaxTree(tokens[0], this);
    const right =
      this.consume(tokens.slice(2)) || new AbstractSyntaxTree(tokens[2], this);
    return new AbstractSyntaxTree(tokens[1], this).setChildren([left, right]);
  }
}
