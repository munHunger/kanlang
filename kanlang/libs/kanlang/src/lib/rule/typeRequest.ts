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
            console.log(this.printScope());
            if (varInScope) return [varInScope + ':' + type];
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
                      return 'recc:' + arg + ':' + this.request(arg);
                    })
                    .join(', ')})`;
                }
              });
          }
          toJs(): string {
            return this.request(this.type()).join('<>');
          }
          type(): string {
            return this.tokenValue(1);
          }
          toString(): string {
            return `${this.tokenValue(1)} fetched from scope`;
          }
          validate(): void {
            //TODO: validate it
          }
        },
      },
    ];
  }
}
