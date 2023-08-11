import { TokenType } from '../tokenizer';
import { Rule } from './rule';

export class Arithmetic extends Rule {
  get rules(): [number, ...(TokenType | Rule)[]][] {
    return [[0, new Sum()]];
  }
}

export class Sum extends Rule {
  get rules(): [number, ...Array<TokenType | [TokenType, string] | Rule>][] {
    return [
      [1, new Product(), ['operator', '+'], this],
      [1, new Product(), ['operator', '-'], this],
      [0, new Product()],
    ];
  }
}

export class Product extends Rule {
  get rules(): [number, ...Array<TokenType | [TokenType, string] | Rule>][] {
    return [
      [1, this, ['operator', '*'], 'number'],
      [1, this, ['operator', '/'], 'number'],
      [0, 'number'],
    ];
  }
}
