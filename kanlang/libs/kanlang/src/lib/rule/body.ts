import { ParseTree } from '../parseTree';
import { Expression, Return } from './expression';
import { NewRuleType, Rule } from './rule';
import { TypeRequest, TypeRequestTree } from './typeRequest';

export class Body extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Expression(), ['punct', ';']],
        treeClass: class extends ParseTree {
          toJs(): string {
            return `${this.children[0].toJs()};`;
          }
          toString(): string {
            return `${this.children[0].toString()} ${this.printScope()}`;
          }
        },
      },
      {
        root: 0,
        parts: [new Return(), ['punct', ';']],
        treeClass: class extends ParseTree {
          toJs(): string {
            return `${this.children[0].toJs()};`;
          }
          toString(): string {
            return `${this.children[0].toString()} ${this.printScope()}`;
          }
        },
      },
      {
        root: 0,
        parts: [new Expression(), ['punct', ';'], this],
        treeClass: class extends ParseTree {
          toJs(): string {
            const typeRequests =
              this.getChildrenOfType<TypeRequestTree>(TypeRequestTree);
            if (typeRequests.length > 0) {
              return `\n${typeRequests
                .map((v) => v.getHoistJs())
                .join(
                  ';'
                )};\n\n ${this.children[0].toJs()};\n${this.children[1].toJs()}`;
            }
            return `${this.children[0].toJs()};\n${this.children[1].toJs()}`;
          }
          toString(): string {
            return `${this.children[0].toString()}\n${this.children[1].toString()}`;
          }
        },
      },
      {
        root: 0,
        parts: [new Return(), ['punct', ';'], this],
        treeClass: class extends ParseTree {
          toJs(): string {
            return `${this.children[0].toJs()};\n${this.children[1].toJs()}`;
          }
          toString(): string {
            return `${this.children[0].toString()}\n${this.children[1].toString()}`;
          }
        },
      },
    ];
  }
}
