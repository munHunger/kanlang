import { TokenType } from '../tokenizer';
import { Expression } from './';
import { Rule } from './rule';

export class VariableAssignment extends Rule {
  get rules(): [number, ...Array<TokenType | [TokenType, string] | Rule>][] {
    return [
      [
        0,
        ['keyword', 'let'],
        'identifier',
        ['operator', '='],
        new Expression(),
      ],
    ];
  }
}
