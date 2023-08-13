import { Body } from './body';
import { NewRuleType, Rule } from './rule';

/**
 * (identifier: type): type {
 *  body
 * }
 */
export class Function extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['punct', '('],
          ['punct', ')'],
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        carryScope: false,
      },
    ];
  }
}
