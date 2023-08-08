import { AbstractSyntaxTree } from '../ast';
import { Token, TokenType } from '../tokenizer';

export abstract class Rule {
  abstract get rules(): [number, ...Array<TokenType | Rule>][];

  get ruleName(): string {
    return (<any>this).constructor.name;
  }

  toGrammarString() {
    return this.rules
      .map(([root, ...rule]) =>
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
    for (const [root, ...rule] of this.rules) {
      if (tokens.length < rule.length) continue;
      const consume = rule.map((part, i) => {
        if (typeof part === 'string') {
          if (tokens[i].type === part)
            return new AbstractSyntaxTree(tokens[i], this);
        } else if (part.ruleBasedConsume(tokens.slice(i)))
          return part.ruleBasedConsume(tokens.slice(i)); //DRY
      });
      if (consume.every((token) => token))
        return consume[root].setChildren(
          consume.slice(0, root).concat(consume.slice(root + 1))
        );
    }
    return null;
  }

  consume(tokens: Token[]): AbstractSyntaxTree {
    return null;
  }
}
