import { Arithmetic } from './arithmetic';
import { NewRuleType, Rule } from './rule';

export class Expression extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Arithmetic()],
        meta: () => ({ type: 'num' }),
      },
    ];
  }
}
