import { State } from '../earley';
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
  carryScope?: boolean;
  meta?: (scope: Record<string, Declaration>, state: State) => { type: string };
};
export abstract class Rule {
  abstract get rules(): NewRuleType[];

  get ruleName(): string {
    return (<any>this).constructor.name;
  }
}
