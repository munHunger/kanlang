import { TokenType } from '../tokenizer';
import { Rule } from './rule';

export class Arithmetic extends Rule {
  get rules(): [number, ...(TokenType | Rule)[]][] {
    return [
      [1, 'number', 'operator', this],
      [1, 'number', 'operator', 'number'],
    ];
  }
}
