import { Rule } from './rule/rule';
import { Token } from './tokenizer';

export class AbstractSyntaxTree {
  token: Token;
  consumer: Rule;
  children: AbstractSyntaxTree[];

  constructor(token: Token, consumer: Rule) {
    this.token = token;
    this.consumer = consumer;
    this.children = [];
  }

  setChildren(children: AbstractSyntaxTree[]): AbstractSyntaxTree {
    this.children = children;
    return this;
  }

  toAstString(): string {
    if (this.children.length === 0) return this.token.value;
    return `${this.token.value}(${this.children
      .map((child) => child.toAstString())
      .join(', ')})`;
  }

  toParseTreeString(): string {
    if (this.children.length === 0) return this.token.value;
    return `${(<any>this.consumer).constructor.name}:${
      this.token.value
    }(${this.children.map((child) => child.toAstString()).join(', ')})`;
  }
}
