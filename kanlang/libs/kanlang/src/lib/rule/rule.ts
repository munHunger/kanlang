import { AbstractSyntaxTree } from '../ast';
import { Token, TokenType } from '../tokenizer';

export type RuleType = Array<TokenType | [TokenType, string] | Rule>;

export abstract class Rule {
  abstract get rules(): [number, ...RuleType][];

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
            } else if (t instanceof Rule) return t.ruleName;
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

  consume(tokens: Token[]): AbstractSyntaxTree {
    throw new Error('this shit did not work');
    console.log('consuming tokens', this.ruleName, tokens);
    for (const [root, ...rule] of this.rules) {
      if (tokens.length < rule.length) continue;
      const consume: AbstractSyntaxTree[] = rule.map((part, i) => {
        let consume: AbstractSyntaxTree;
        //it is TokenType and therefore plain string
        if (typeof part === 'string') {
          if (tokens[i].type === part)
            return new AbstractSyntaxTree(tokens[i], this);
        } else if (Array.isArray(part)) {
          //check both type and value
          if (tokens[i].type === part[0] && tokens[i].value === part[1])
            return new AbstractSyntaxTree(tokens[i], this);
        } else if ((consume = part.consume(tokens.slice(i)))) {
          console.log(
            `${part.ruleName} could consume tokens for current rule ${this.ruleName}`,
            consume.toAstString()
          );
          return consume;
        }
      });
      if (consume.every((token) => token))
        return consume[root].setChildren(
          consume.slice(0, root).concat(consume.slice(root + 1))
        );
    }
    return null;
  }
}
