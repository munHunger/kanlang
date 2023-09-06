import { CompileError } from './compileError';
import { NewRuleType, Rule } from './rule/rule';
import { Token, TokenType } from './tokenizer';

export type State = NewRuleType & {
  position: { rule: number; origin: number };
  ruleRef: Rule;
  tree: (State | Token)[];
};
export class EarleyParser {
  constructor(private startingRule: Rule) {}

  parse(tokens: Token[]): State {
    tokens = tokens.filter(
      (token) => token.type !== 'whitespace' && token.type !== 'comment'
    );
    if (tokens.length == 0) throw new Error('cannot parse empty set');
    const stateSets: Array<Array<State>> = new Array(tokens.length + 1)
      .fill(undefined)
      .map(() => []);

    this.startingRule.rules.forEach((rule) =>
      stateSets[0].push({
        ...rule,
        position: {
          origin: 0,
          rule: 0,
        },
        ruleRef: this.startingRule,
        tree: [],
      })
    );
    for (let k = 0; k < stateSets.length; k++) {
      let n = 0;
      while (n < stateSets[k].length) {
        const state = stateSets[k][n];
        n++;
        if (this.isComplete(state)) {
          //finished state
          const completions = this.complete(state, stateSets);
          completions
            .filter(
              //We don't need duplicates
              (newState) =>
                !stateSets[k].find((set) => this.isEqual(set, newState))
            )
            .forEach((newState) => stateSets[k].push(newState));
        } else {
          if (this.isTerminalToken(this.nextElementInState(state))) {
            //terminal
            if (k < stateSets.length - 1) {
              const scanned = this.scan(state, k, tokens);
              if (scanned) stateSets[k + 1].push(scanned);
            }
          } else {
            //non terminal
            const predictions = this.predict(state, k);
            predictions
              .filter(
                //We don't need duplicates
                (newState) =>
                  !stateSets[k].find((set) => this.isEqual(set, newState))
              )
              .forEach((newState) => stateSets[k].push(newState));
          }
        }
      }
    }

    const parseOrder = stateSets[stateSets.length - 1].filter(
      (v) => v.position.rule === v.parts.length && v.position.origin == 0
    );
    const parsableWays = parseOrder.length;
    // TODO: this is removed as the ambiguity isn't properly solved. Check invisible rules (rules that just redirect)
    // if (parsableWays > 1)
    //   console.log(
    //     `\x1b[33m[WARN]\x1b[0m grammar is ambigous and could parse input in \x1b[36m${parsableWays}\x1b[0m different ways`
    //   );
    if (parseOrder.length > 0)
      return {
        ...parseOrder[0],
      };

    this.reportError(stateSets, tokens);
  }

  private reportError(stateSets: Array<Array<State>>, tokens: Token[]) {
    for (let k = stateSets.length - 1; k >= 0; k--) {
      if (stateSets[k].length > 0) {
        //Last state with data
        const expectedNext: Set<string> = new Set();
        for (let n = 0; n < stateSets[k].length; n++) {
          const state = stateSets[k][n];
          const nextElement = this.nextElementInState(state);
          if (this.isTerminalToken(nextElement)) {
            if (Array.isArray(nextElement)) expectedNext.add(nextElement[1]);
            else expectedNext.add(nextElement);
          } else if (!this.isComplete(state)) {
            const predictions = this.predict(state, k);
            predictions
              .filter(
                //We don't need duplicates
                (newState) =>
                  !stateSets[k].find((set) => this.isEqual(set, newState))
              )
              .forEach((newState) => stateSets[k].push(newState));
          }
        }
        const expectedTokens = `\n  Expected one of:\n${[...expectedNext]
          .map((expected) => '    ' + expected)
          .join('\n')}`;
        if (k == tokens.length) {
          const printed = this.printStateSets(stateSets);
          // for (let i = 0; i < printed.length; i++) {
          //   console.log(
          //     `\x1b[33m${tokens[i]?.type}:${
          //       tokens[i]?.value
          //     }\x1b[36m(${i})\x1b[0m\n--------------------------\n${printed[
          //       i
          //     ].join('\n')}`
          //   );
          // }
          throw new CompileError(
            tokens[k - 1],
            `Syntax error.\n  Missing token after ${
              tokens[k - 1].value
            }.${expectedTokens}`
          );
        } else
          throw new CompileError(
            tokens[k],
            `Syntax error.\n  Unexpected token "${tokens[k].value}".${expectedTokens}`
          );
      }
    }
    throw new Error('The code exploded spectacularly');
  }

  private isComplete(state: State): boolean {
    return state.position.rule == state.parts.length;
  }

  private isState(object: any): object is State {
    return object.ruleRef != null;
  }
  private treeToString(state: State): string {
    const name = state.ruleRef.ruleName;
    const rules = state.tree
      .map((part) =>
        this.isState(part) ? this.treeToString(part) : `'${part.value}'`
      )
      .join(', ');

    return `${name}(${rules})`;
  }

  private isEqual(a: State, b: State): boolean {
    return (
      JSON.stringify([a.position, a.parts, a.ruleRef.ruleName]) ===
      JSON.stringify([b.position, b.parts, b.ruleRef.ruleName])
    );
  }

  private isTerminalToken(
    token: Rule | TokenType | [TokenType, string]
  ): token is TokenType | [TokenType, string] {
    return typeof token == 'string' || Array.isArray(token);
  }

  /**
   * Note that this method is great for debuging the earley algorithm to figure out what it is doing in each set
   * @param stateSets
   * @returns
   */
  private printStateSets(stateSets: Array<Array<State>>): string[][] {
    const stateName = (state?: State) => (state ? state.ruleRef.ruleName : '');
    return stateSets.map((stack) =>
      stack.map(
        (state) =>
          `${this.isComplete(state) ? '\x1b[32m' : '\x1b[31m'}${stateName(
            state
          )}\x1b[0m -> ${state.parts
            .map(
              (r, i) =>
                (state.position.rule == i ? '•' : '') +
                this.ruleToName(r) +
                (state.position.rule == state.parts.length &&
                state.position.rule == i + 1
                  ? '•'
                  : '')
            )
            .join(' ')} (${state.position.origin})`
      )
    );
  }

  private ruleToName(rule: Rule | TokenType | [TokenType, string]): string {
    if (rule instanceof Rule) return rule.ruleName;
    if (Array.isArray(rule)) return rule.join(':');
    return rule;
  }

  private nextElementInState(state: State) {
    return state.parts[state.position.rule];
  }

  /**
   * Prediction: For every state in S(k) of the form (X → α • Y β, j) (where j is the origin position as above),
   * add (Y → • γ, k) to S(k) for every production in the grammar with Y on the left-hand side (Y → γ).
   *
   * i.e. the next part of the rule in the state contains a non terminal and needs to be "replaced" with a Rule
   *
   * @param state a state frame
   * @param k the absolute token index
   * @returns new state frames
   */
  private predict(state: State, k: number): State[] {
    const nextElement = this.nextElementInState(state);
    if (typeof nextElement == 'string' || Array.isArray(nextElement))
      throw new Error('Internal error. Prediction only works on rules');

    return nextElement.rules.map(
      (rule): State => ({
        ...rule,
        position: {
          rule: 0,
          origin: k,
        },
        ruleRef: nextElement,
        tree: [],
      })
    );
  }

  /**
   * Scanning: If a is the next symbol in the input stream,
   * for every state in S(k) of the form (X → α • a β, j), add (X → α a • β, j) to S(k+1).
   *
   * @param state a state frame
   * @returns new state frames
   */
  private scan(state: State, k: number, tokens: Token[]): State {
    const token = tokens[k];
    const nextElement = this.nextElementInState(state);
    if (
      (typeof nextElement == 'string' && token.type == nextElement) ||
      (Array.isArray(nextElement) &&
        token.type == nextElement[0] &&
        token.value == nextElement[1])
    ) {
      return {
        ...state,
        position: {
          origin: state.position.origin,
          rule: state.position.rule + 1,
        },
        tree: state.tree.concat([token]),
      };
    }
  }

  /**
   * Completion: For every state in S(k) of the form (Y → γ •, j),
   * find all states in S(j) of the form (X → α • Y β, i) and add (X → α Y • β, i) to S(k).
   *
   * @param state a completed state in S(k) on the form (Y → γ •, j)
   * @param stateSets the full state set
   * @returns new state frames
   */
  private complete(state: State, stateSets: Array<Array<State>>): State[] {
    const completedRule = state.ruleRef.ruleName;
    const completableRules = stateSets[state.position.origin].filter((s) => {
      const nextElement = s.parts[s.position.rule];
      return (
        nextElement instanceof Rule && nextElement.ruleName == completedRule
      );
    });
    return completableRules.map((s) => ({
      ...s,
      position: {
        ...s.position,
        rule: s.position.rule + 1,
      },
      tree: s.tree.concat([state]),
    }));
  }
}
