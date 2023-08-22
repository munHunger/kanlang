import { ParseTree } from '../parseTree';
import { Function } from './function';
import { NewRuleType, Rule } from './rule';
import { TypeDef } from './typeDef';

export class Main extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Function(), this],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.children.map((c) => c.toString()).join('\n');
          }
          validate(): void {
            this.children.forEach((child) => child.mergeParentScope());
          }
        },
      },
      {
        root: 0,
        parts: [new TypeDef(), this],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.children.map((c) => c.toString()).join('\n');
          }
          validate(): void {
            this.children.forEach((child) => child.mergeParentScope());
          }
        },
      },
      {
        root: 0,
        parts: [new Function()], //TODO: a bit weird that you have to end like this. Would be better if epsilon worked
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new TypeDef()], //TODO: a bit weird that you have to end like this. Would be better if epsilon worked
        invisibleNode: true,
      },
    ];
  }
}
