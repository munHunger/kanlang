import { Token } from './tokenizer';

export class AbstractSyntaxTree {
  token: Token;
  children: AbstractSyntaxTree[];
}
