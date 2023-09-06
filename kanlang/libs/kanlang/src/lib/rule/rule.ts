import { ParseTree } from '../parseTree';
import { TokenType } from '../tokenizer';

export type RuleType = Array<TokenType | [TokenType, string] | Rule>;
export type NewRuleType = {
  parts: RuleType;
  invisibleNode?: boolean;
  treeClass?: typeof ParseTree;
};
export abstract class Rule {
  abstract get rules(): NewRuleType[];

  get ruleName(): string {
    return (<any>this).constructor.name;
  }
}
