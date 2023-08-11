import { Rule, RuleType } from './rule/rule';
import { Token, TokenType } from './tokenizer';

type State = {
  position: { rule: number; origin: number };
  rule: RuleType;
  ruleRef: Rule;
  from?: State;
};

class StartingRule extends Rule {
  constructor(private rule: [Rule, ...RuleType][]) {
    super();
  }

  get rules(): [number, ...RuleType][] {
    return this.rule.map((r) => [0, ...r.slice(1)]);
  }
}

export class EarleyParser {
  rules: [Rule, ...RuleType][] = [];

  registerRule(rule: Rule) {
    rule.rules
      .map((r) => [rule, ...r.slice(1)] as [Rule, ...RuleType])
      .forEach((r) => this.rules.push(r));
  }

  /**
 * DECLARE ARRAY S;

function INIT(words)
    S ← CREATE_ARRAY(LENGTH(words) + 1)
    for k ← from 0 to LENGTH(words) do
        S[k] ← EMPTY_ORDERED_SET

 */
  /**
function EARLEY_PARSE(words, grammar)
    INIT(words)
    ADD_TO_SET((γ → •S, 0), S[0])
    for k ← from 0 to LENGTH(words) do
        for each state in S[k] do  // S[k] can expand during this loop
            if not FINISHED(state) then
                if NEXT_ELEMENT_OF(state) is a nonterminal then
                    PREDICTOR(state, k, grammar)         // non_terminal
                else do
                    SCANNER(state, k, words)             // terminal
            else do
                COMPLETER(state, k)
        end
    end
    return chart
   */
  parse(tokens: Token[]) {
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
        rule: rule.slice(1) as RuleType,
        ruleRef: startingRule,
      })
    );
    for (let k = 0; k < stateSets.length; k++) {
      for (let n = 0; n < stateSets[k].length; n++) {
        const state = stateSets[k][n];
        if (state.position.rule == state.rule.length) {
          //finished state
          this.complete(state, k, stateSets)
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
    const stacks = this.printStateSets(stateSets);
    const parsableWays = parseOrder.length;
    console.log('done parsing ' + parsableWays);
  }

  private isEqual(a: State, b: State): boolean {
    return (
      a.ruleRef.ruleName == b.ruleRef.ruleName &&
      a.position.origin == b.position.origin &&
      a.position.rule == b.position.rule
    );
  }

  private isTerminalToken(
    token: Rule | TokenType | [TokenType, string]
  ): boolean {
    return typeof token == 'string' || Array.isArray(token);
  }

  private printStateSets(stateSets: Array<Array<State>>): string[][] {
    const stateName = (state?: State) => (state ? state.ruleRef.ruleName : '');
    return stateSets.map((stack) =>
      stack.map(
        (state) =>
          `${stateName(state)} (${stateName(state.from)}) -> ${state.rule
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

    return nextElement.rules.map((rule) => ({
      position: {
        rule: 0,
        origin: k,
      },
      rule: rule.slice(1) as RuleType,
      ruleRef: nextElement,
      from: state,
    }));
  }

  /**
   * Scanning: If a is the next symbol in the input stream, 
   * for every state in S(k) of the form (X → α • a β, j), add (X → α a • β, j) to S(k+1).
   * 
procedure SCANNER((A → α•aβ, j), k, words)
    if j < LENGTH(words) and a ⊂ PARTS_OF_SPEECH(words[k]) then
        ADD_TO_SET((A → αa•β, j), S[k+1])
    end
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
      };
    }
  }

  /**
   * Completion: For every state in S(k) of the form (Y → γ •, j), 
   * find all states in S(j) of the form (X → α • Y β, i) and add (X → α Y • β, i) to S(k).
   * 
procedure COMPLETER((B → γ•, x), k)
    for each (A → α•Bβ, j) in S[x] do
        ADD_TO_SET((A → αB•β, j), S[k])
    end
   * @param state a completed state in S(k) on the form (Y → γ •, j)
   * @param stateSets the full state set
   * @returns new state frames
   */
  private complete(
    state: State,
    k: number,
    stateSets: Array<Array<State>>
  ): State[] {
    const completedRule = state.ruleRef.ruleName;
    const completableRules = stateSets
      .slice(0, k)
      .flat()
      .filter((s) => {
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
    }));
  }
}
