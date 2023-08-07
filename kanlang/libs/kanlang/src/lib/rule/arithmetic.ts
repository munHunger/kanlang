import { AbstractSyntaxTree } from '../ast';
import { Token } from '../tokenizer';
import { Rule } from './rule';

export class Arithmetic extends Rule {
  consume(tokens: Token[]): AbstractSyntaxTree | undefined {
    if (tokens.length < 3) return null;
    if (tokens[1].type !== 'operator') return null;
    if (tokens[0].type !== 'number' || tokens[2].type !== 'number') return null;
    const left = new AbstractSyntaxTree(tokens[0]);
    const right =
      this.consume(tokens.slice(2)) || new AbstractSyntaxTree(tokens[2]);
    return new AbstractSyntaxTree(tokens[1]).setChildren([left, right]);
  }
}
