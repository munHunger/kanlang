import { AbstractSyntaxTree } from '../ast';
import { Token, TokenType } from '../tokenizer';

export abstract class Rule {
  abstract get rules(): Array<Array<Rule | TokenType>>;

  get ruleName(): string {
    return (<any>this).constructor.name;
  }

  toString() {
    return this.rules
      .map((rule) =>
        rule
          .map((t) => {
            if (typeof t === 'string') {
              return t;
            }
            return t.ruleName;
          })
          .join(' ')
      )
      .reduce((acc, val) => {
        if (!acc) return this.ruleName + ' -> ' + val;
        return (
          acc +
          '\n' +
          new Array(this.ruleName.length + 2).fill(' ').join('') +
          '| ' +
          val
        );
      }, undefined);
  }

  ruleBasedConsume(tokens: Token[]): AbstractSyntaxTree {
    for (const rule of this.rules) {
      if (tokens.length < rule.length) continue;
      const consume = rule.map((part, i) => {
        if (typeof part === 'string') {
          if (tokens[i].type === part) return new AbstractSyntaxTree(tokens[i]);
        } else if (part.ruleBasedConsume(tokens.slice(i)))
          return part.ruleBasedConsume(tokens.slice(i)); //DRY
      });
      if (consume.every((token) => token)) return consume[0];
    }
    return null;
  }

  abstract consume(tokens: Token[]): AbstractSyntaxTree;
}
