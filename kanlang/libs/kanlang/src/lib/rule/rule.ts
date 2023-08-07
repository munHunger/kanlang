import { AbstractSyntaxTree } from '../ast';
import { Token } from '../tokenizer';

export abstract class Rule {
  abstract consume(tokens: Token[]): AbstractSyntaxTree;
}
