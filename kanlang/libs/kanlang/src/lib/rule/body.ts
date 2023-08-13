import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';

export class Body extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Expression(), ['punct', ';']],
        carryScope: true,
      },
      {
        root: 0,
        parts: [this, new Expression(), ['punct', ';']],
        carryScope: true,
      },
    ];
  }
}
