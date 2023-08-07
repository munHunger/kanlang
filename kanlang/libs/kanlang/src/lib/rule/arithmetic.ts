import { AbstractSyntaxTree } from '../ast';
import { Token } from '../tokenizer';
import { Rule } from './rule';

export class Arithmetic extends Rule {
  consume(tokens: Token[]): AbstractSyntaxTree {
    return {
      token: tokens[1],
      children: [],
    };
  }
}
