import { Token } from './tokenizer';

export class CompileError implements Error {
  public charIndex: number;
  public lineNumber: number;
  private msg: string;
  constructor(private token: Token | Token[], message: string) {
    this.msg = message;
    if (Array.isArray(token)) {
      if (token.length > 0) {
        this.charIndex = token[0].position.character;
        this.lineNumber = token[0].position.line;
      }
    } else {
      this.charIndex = token.position.character;
      this.lineNumber = token.position.line;
    }
    this.name = CompileError.name;
  }
  name = CompileError.name;
  stack?: string;

  get length(): number {
    if (Array.isArray(this.token)) {
      const lastToken = this.token[this.token.length - 1];
      return lastToken.start - this.token[0].start + lastToken.value.length;
    } else {
      return this.token.value.length;
    }
  }

  get message(): string {
    return this.msg;
  }
}
