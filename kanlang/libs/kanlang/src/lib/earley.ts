import { Rule, RuleType } from './rule/rule';
import { Token, TokenType } from './tokenizer';

type State = {
  position: { rule: number; origin: number };
  rule: RuleType;
  ruleRoot: number;
  ruleRef: Rule;
  tree: (State | Token)[];
};

class StartingRule extends Rule {
  constructor(private rule: [Rule, number, ...RuleType][]) {
    super();
  }

  get rules(): [number, ...RuleType][] {
    return this.rule.map((r) => [r[1], ...(r.slice(2) as RuleType)]);
  }
}

export class EarleyParser {
  rules: [Rule, number, ...RuleType][] = [];

  registerRule(rule: Rule) {
    rule.rules
      .map((r) => [rule, ...r] as [Rule, number, ...RuleType])
      .forEach((r) => this.rules.push(r));
  }

  parse(tokens: Token[]): State & { toAstString: () => string } {
    if (tokens.length == 0) throw new Error('cannot parse empty set');
    const stateSets: Array<Array<State>> = new Array(tokens.length + 1)
      .fill(undefined)
      .map(() => []);

    const startingRule = new StartingRule(this.rules);
    startingRule.rules.forEach((rule) =>
      stateSets[0].push({
        position: {
          origin: 0,
          rule: 0,
        },
        ruleRoot: rule[0],
        rule: rule.slice(1) as RuleType,
        ruleRef: startingRule,
        tree: [],
      })
    );
    for (let k = 0; k < stateSets.length; k++) {
      for (let n = 0; n < stateSets[k].length; n++) {
        const state = stateSets[k][n];
        if (state.position.rule == state.rule.length) {
          //finished state
          const completions = this.complete(state, stateSets);
          completions
            .filter(
              //We don't need duplicates
              (newState) =>
                !stateSets[k].find((set) => this.isEqual(set, newState))
            )
            .forEach((newState) => stateSets[k].push(newState));
        } else if (k < stateSets.length - 1) {
          if (this.isTerminalToken(this.nextElementInState(state))) {
            //terminal
            const scanned = this.scan(state, k, tokens);
            if (scanned) stateSets[k + 1].push(scanned);
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
      (v) => v.position.rule === v.rule.length && v.position.origin == 0
    );
    const parsableWays = parseOrder.length;
    if (parsableWays > 1)
      console.log(
        `\x1b[33m[WARN]\x1b[0m grammar is ambigous and could parse input in \x1b[36m${parsableWays}\x1b[0m different ways`
      );
    if (parseOrder.length > 0)
      return {
        ...parseOrder[0],
        toAstString: () => this.toAstString(parseOrder[0]),
      };
    throw new Error("could not parse. doesn't look like valid grammar to me");
  }

  private isState(object: any): object is State {
    return object.ruleRef != null;
  }
  private treeToString(state: State): string {
    const name = state.ruleRef.ruleName + state.ruleRoot;
    const rules = state.tree
      .map((part) =>
        this.isState(part) ? this.treeToString(part) : `'${part.value}'`
      )
      .join(', ');

    return `${name}(${rules})`;
  }

  private toAstString(state: State): string {
    const rules = state.tree.map((part) =>
      this.isState(part) ? this.toAstString(part) : `${part.value}`
    );

    if (rules.length > 1)
      return `${rules[state.ruleRoot]}(${rules
        .slice(0, state.ruleRoot)
        .concat(rules.slice(state.ruleRoot + 1))
        .join(', ')})`;
    return `${rules[state.ruleRoot]}`;
  }

  private isEqual(a: State, b: State): boolean {
    return (
      JSON.stringify([a.position, a.rule, a.ruleRef.ruleName]) ===
      JSON.stringify([b.position, b.rule, b.ruleRef.ruleName])
    );
  }

  private isTerminalToken(
    token: Rule | TokenType | [TokenType, string]
  ): boolean {
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
          `${stateName(state)} -> ${state.rule
            .map(
              (r, i) =>
                (state.position.rule == i ? '•' : '') +
                this.ruleToName(r) +
                (state.position.rule == state.rule.length &&
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
    return state.rule[state.position.rule];
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
        position: {
          rule: 0,
          origin: k,
        },
        ruleRoot: rule[0],
        rule: rule.slice(1) as RuleType,
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
      const nextElement = s.rule[s.position.rule];
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
