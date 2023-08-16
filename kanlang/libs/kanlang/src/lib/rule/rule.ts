import { State } from '../earley';
import { ParseTree } from '../parseTree';
import { Declaration } from '../semantic';
import { TokenType } from '../tokenizer';

export type RuleType = Array<TokenType | [TokenType, string] | Rule>;
export type NewRuleType = {
  root: number;
  parts: RuleType;
  semantic?: (
    scope: Record<string, Declaration>,
    state: State
  ) => Declaration | undefined;
  invisibleNode?: boolean;
  treeClass?: typeof ParseTree;
  carryScope?: boolean;
  meta?: (state: State) => { type: string };
};
export abstract class Rule {
  abstract get rules(): NewRuleType[];

  get ruleName(): string {
    return (<any>this).constructor.name;
  }
}
