import { ParseTree } from '../parseTree';
import { Expression, Return } from './expression';
import { NewRuleType, Rule } from './rule';

export class Body extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Expression(), ['punct', ';']],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.children[0].toString()} ${this.printScope()}`;
          }
        },
      },
      {
        root: 0,
        parts: [new Return(), ['punct', ';']],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.children[0].toString()} ${this.printScope()}`;
          }
        },
      },
      {
        root: 0,
        parts: [new Expression(), ['punct', ';'], this],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.children[0].toString()}\n${this.children[1].toString()}`;
          }
        },
      },
    ];
  }
}
