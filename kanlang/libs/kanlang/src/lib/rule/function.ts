import { State } from '../earley';
import { Token } from '../tokenizer';
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
          new ArgumentArray(),
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

export class ArgumentArray extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, ['punct', ','], new Argument()],
        carryScope: true,
      },
      {
        root: 0,
        carryScope: true,
        parts: [new Argument()],
      },
      {
        root: 0,
        parts: [], //epsilon rule
      },
    ];
  }
}

export class Argument extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: ['identifier', ['punct', ':'], 'identifier'],
        carryScope: true,
        semantic: (scope, state) => ({
          name: (state.tree[0] as Token).value,
          variable: {
            constant: false,
            primitive: true, //TODO: is it?
            type: (state.tree[2] as Token).value,
          },
        }),
      },
    ];
  }
}
