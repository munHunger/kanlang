import { Token } from './tokenizer';

export class AbstractSyntaxTree {
  token: Token;
  children: AbstractSyntaxTree[];

  constructor(token: Token) {
    this.token = token;
    this.children = [];
  }

  setChildren(children: AbstractSyntaxTree[]): AbstractSyntaxTree {
    this.children = children;
    return this;
  }

  toString(): string {
    if (this.children.length === 0) return this.token.value;
    return `${this.token.value}(${this.children
      .map((child) => child.toString())
      .join(', ')})`;
  }
}
