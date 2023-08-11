import { TokenType } from '../tokenizer';
import { Arithmetic } from './arithmetic';
import { Rule } from './rule';

export class Expression extends Rule {
  get rules(): [number, ...Array<TokenType | [TokenType, string] | Rule>][] {
    return [
      [0, new Arithmetic()], //A pure math statement is an expression.
      [1, this, ['operator', '=='], this], //this is left side recursive and will break
      [0, 'number'],
    ];
  }
}
