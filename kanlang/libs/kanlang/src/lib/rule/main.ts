import { ParseTree } from '../parseTree';
import { Function } from './function';
import { NewRuleType, Rule } from './rule';
import { TypeDef } from './typeDef';

export class Main extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, this], //Strange way to handle repetition. unlikely to be efficeint, but seems to work
        treeClass: class extends ParseTree {
          toString(): string {
            return this.children.map((c) => c.toString()).join('\n');
          }
        },
      },
      {
        root: 0,
        parts: [new Function()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new TypeDef()],
        invisibleNode: true,
      },
    ];
  }
}
