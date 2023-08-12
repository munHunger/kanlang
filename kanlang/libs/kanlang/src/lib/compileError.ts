import { Token } from './tokenizer';

export class CompileError extends Error {
  public charIndex: number;
  public lineNumber: number;
  constructor(private token: Token, message: string) {
    super(`${message}`);
    this.charIndex = token.position.character;
    this.lineNumber = token.position.line;
    this.name = CompileError.name;
  }

  get length(): number {
    return this.token.value.length;
  }
}
