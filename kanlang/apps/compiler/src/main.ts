//import tm from './assets/kanlang.tmLanguage.json';
import fs from 'fs';
import { Tokenizer } from './tokenizer';

const tokenizer = new Tokenizer();

fs.writeFileSync(
  __dirname + '/../lsp/syntaxes/kanlang.tmLanguage.json',
  JSON.stringify(tokenizer.tmLang, null, 2)
);

const tokens = tokenizer.tokenize(`
(a: int, b: int) => {
    a + b
}
`);
console.log(tokens);
