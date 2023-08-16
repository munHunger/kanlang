import { Arithmetic } from './arithmetic';
import { NewRuleType, Rule } from './rule';
import { VariableAssignment } from './variable';

export class Expression extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['keyword', 'return'], this],
      },
      {
        root: 0,
        parts: [new Arithmetic()],
        meta: () => ({ type: 'num' }),
        invisibleNode: true,
      },
      {
        root: 0,
        parts: ['boolean'],
        meta: () => ({ type: 'boolean' }),
      },
      {
        root: 0,
        parts: [new VariableAssignment()],
        meta: () => ({ type: 'void' }), //void or type of variable?
        carryScope: true,
        invisibleNode: true,
      },
    ];
  }
}
