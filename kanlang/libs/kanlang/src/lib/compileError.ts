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

export class CompileErrors implements Error {
  constructor(public errors: CompileError[], private tokens: Token[]) {
    this.name = CompileError.name;
  }
  get message(): string {
    return this.errors
      .map((e) => {
        const line = this.tokens
          .filter((token) => token.position.line === e.lineNumber)
          .map((t) => t.value)
          .join(' ');
        const linum = (e.lineNumber + '    ').substring(0, 4);
        return `${linum} | ${line} \n ${e.message}`;
      })
      .join('\n\n');
  }
  stack?: string;
  name = CompileError.name;
}
