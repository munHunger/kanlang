//import tm from './assets/kanlang.tmLanguage.json';
import fs from 'fs';
import { Tokenizer, compile } from '@kanlang/kanlang';

const tokenizer = new Tokenizer();
const argArray = process.argv.slice(2);
if (argArray.length === 0) {
  printHelp();
} else {
  const args: any = {};
  for (let i = 0; i < argArray.length; i++) {
    if (argArray[i] == '--generate-tmlanguage') {
      args.tmLocation = argArray[i + 1];
      i++;
    }
    if (argArray[i] == '-h') {
      printHelp();
    }
  }
  if (args.tmLocation) {
    fs.writeFileSync(
      args.tmLocation,
      JSON.stringify(tokenizer.tmLang, null, 2)
    );
  } else {
    const src = fs.readFileSync(argArray[0], 'utf-8');
    fs.writeFileSync(argArray[0] + '.js', compile(src).out);
  }
}

function printHelp() {
  console.log('you probably need help');
}
