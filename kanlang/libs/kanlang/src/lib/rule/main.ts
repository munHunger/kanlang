import { Function } from './function';
import { NewRuleType, Rule } from './rule';

export class Main extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, new Function()],
        carryScope: true,
      },
      {
        root: 0,
        parts: [new Function()],
        carryScope: true,
      },
    ];
  }
}
