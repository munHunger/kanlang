import { ParseTree } from '../parseTree';
import { If } from './control';
import { Expression, Return } from './expression';
import { NewRuleType, Rule } from './rule';
import { TypeRequest, TypeRequestTree } from './typeRequest';

export class BodyTree extends ParseTree {
  toJs(): string {
    return `${this.hoist()}${this.children[0].toJs()};${this.childJs()}`;
  }
  toString(): string {
    return `${this.children[0].toString()} ${this.printScope()}${this.childString()}`;
  }
  hoist(): string {
    const typeRequests =
      this.getChildrenOfType<TypeRequestTree>(TypeRequestTree);
    if (typeRequests.length > 0)
      return `\n${typeRequests.map((v) => v.getHoistJs()).join('')}\n`;
    return '';
  }

  childJs(): string {
    if (this.children[1]) return `\n${this.children[1].toJs()}`;
    return '';
  }

  childString(): string {
    if (this.children[1]) return `\n${this.children[1].toString()}`;
    return '';
  }
}

export class Body extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Expression(), ['punct', ';'], this],
        treeClass: class extends BodyTree {},
      },
      {
        root: 0,
        parts: [new If(), ['punct', ';'], this],
        treeClass: class extends BodyTree {},
      },
      {
        root: 0,
        parts: [new Return(), ['punct', ';'], this],
        treeClass: class extends BodyTree {},
      },
      {
        root: 0,
        parts: [],
        invisibleNode: true,
      },
    ];
  }
}
