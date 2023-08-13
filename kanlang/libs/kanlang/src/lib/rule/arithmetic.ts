import { TokenType } from '../tokenizer';
import { NewRuleType, Rule } from './rule';

export class Arithmetic extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Sum()],
        meta: () => ({ type: 'num' }),
      },
    ];
  }
}

export class Sum extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 1,
        parts: [new Product(), ['operator', '+'], this],
        meta: () => ({ type: 'num' }),
      },
      {
        root: 1,
        parts: [new Product(), ['operator', '-'], this],
        meta: () => ({ type: 'num' }),
      },
      {
        root: 0,
        parts: [new Product()],
        meta: () => ({ type: 'num' }),
      },
    ];
  }
}

export class Product extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 1,
        parts: [this, ['operator', '*'], 'number'],
        meta: () => ({ type: 'num' }),
      },
      {
        root: 1,
        parts: [this, ['operator', '/'], 'number'],
        meta: () => ({ type: 'num' }),
      },
      {
        root: 0,
        parts: ['number'],
        meta: () => ({ type: 'num' }),
      },
    ];
  }
}
