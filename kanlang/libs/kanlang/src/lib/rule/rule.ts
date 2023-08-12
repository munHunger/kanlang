import { TokenType } from '../tokenizer';

export type RuleType = Array<TokenType | [TokenType, string] | Rule>;

export abstract class Rule {
  abstract get rules(): [number, ...RuleType][];

  get ruleName(): string {
    return (<any>this).constructor.name;
  }
}
