import { Token, TokenType } from '../tokenizer';
import { Rule } from './rule';

export class If extends Rule {
  get rules(): [number, ...Array<TokenType | [TokenType, string] | Rule>][] {
    return [[1, ['keyword', 'if'], 'operator', this]]; //TODO: need to add expression before going further
  }
}
