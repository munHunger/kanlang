import { ParseTree } from '../parseTree';
import { Arithmetic } from './arithmetic';
import { Function, FunctionParseTree } from './function';
import { NewRuleType, Rule } from './rule';
import { TypeRequest } from './typeRequest';
import { VariableAssignment } from './variable';

export abstract class ReturnExpressionTree extends ParseTree {
  abstract get returnType(): string;
}

export class Return extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['keyword', 'return'], new Expression()],
        treeClass: class extends ReturnExpressionTree {
          get returnType(): string {
            return this.children[0].type();
          }
          toJs(): string {
            return `return ${this.children[0].toJs()}`;
          }
          toString(): string {
            return `return ${this.children[0].toString()}`;
          }
          validate(): void {
            const fn = this.getParentOfType(Function) as FunctionParseTree;
            if (!fn) this.addError('cannot return outside of a function');
            if (fn.returnType != this.returnType)
              this.addError(
                `type missmatch. Cannot return ${this.returnType} in function expecting ${fn.returnType}`
              );
          }
        },
      },
    ];
  }
}

export class Expression extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [this, ['keyword', 'as'], 'identifier'],
        treeClass: class extends ParseTree {
          type(): string {
            return this.tokenValue(2);
          }
          toString(): string {
            return `(${this.children[0].toString()} as ${this.type()})`;
          }
          validate(): void {
            //TODO: Check if type exists
          }
        },
      },
      {
        root: 0,
        parts: [new Arithmetic()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: [new TypeRequest()],
        invisibleNode: true,
      },
      {
        root: 0,
        parts: ['boolean'],
        treeClass: class extends ParseTree {
          type(): string {
            return 'boolean';
          }
          toString(): string {
            return `${this.tokenValue(0)}`;
          }
        },
      },
      {
        root: 0,
        parts: [new VariableAssignment()],
        invisibleNode: true,
      },
    ];
  }
}
