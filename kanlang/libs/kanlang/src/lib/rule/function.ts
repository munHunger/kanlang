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
          ['punct', ':'],
          'identifier',
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        carryScope: true,
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
        meta: (state) => ({
          name: getValue(state.tree[0]),
          type: getValue(state.tree[2]),
        }),
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
function getValue(part: State | Token): string {
  return (part as Token).value; //lets assume this is safe
}
