import { ParseTree } from '../parseTree';
import { Function, FunctionParseTree } from './function';
import { NewRuleType, Rule } from './rule';
import { TypeDef } from './typeDef';

export class Main extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [new Function(), this],
        treeClass: class extends ParseTree {
          toJs(): string {
            return this.children.map((c) => c.toJs()).join('\n');
          }
          toString(): string {
            return this.children.map((c) => c.toString()).join('\n');
          }
          validate(): void {
            //
          }
        },
      },
      {
        parts: [new TypeDef(), this],
        treeClass: class extends ParseTree {
          toJs(): string {
            return this.children[1].toJs();
          }
          toString(): string {
            return this.children.map((c) => c.toString()).join('\n');
          }
          validate(): void {
            //
          }
        },
      },
      {
        parts: [new Function()], //TODO: a bit weird that you have to end like this. Would be better if epsilon worked
        invisibleNode: true,
      },
      {
        parts: [new TypeDef()], //TODO: a bit weird that you have to end like this. Would be better if epsilon worked
        invisibleNode: true,
      },
    ];
  }
}
