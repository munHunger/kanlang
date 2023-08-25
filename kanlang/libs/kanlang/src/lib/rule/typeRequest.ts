import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeRequest extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['operator', '*'], 'identifier'],
        treeClass: class extends ParseTree {
          request(type: string) {
            const varInScope = this.getAllDeclarationsInScope()
              .filter((v) => v.variable)
              .find((v) => v.variable.type === type)?.name;
            if (varInScope) return [varInScope];
            return this.allTransformations
              .filter((t) => t.to == type)
              .map((producer) => {
                if (producer.from.length == 0)
                  return this.transformationToFunctionName(producer) + '()';
                else {
                  return `${this.transformationToFunctionName(
                    producer
                  )}(${producer.from
                    .map((arg) => {
                      return this.request(arg);
                    })
                    .join(', ')})`;
                }
              });
          }
          toJs(): string {
            return this.request(this.type())[0]; //TODO: how to handle recursion?
          }
          type(): string {
            return this.tokenValue(1);
          }
          toString(): string {
            return `${this.tokenValue(1)} fetched from scope`;
          }
          validate(): void {
            //TODO: validate it
            if (this.request(this.type()).length == 0) {
              //TODO: not sure if this is enough
              this.addError(
                'Cannot find a transformation path to ' + this.type()
              );
            }
          }
        },
      },
    ];
  }
}
