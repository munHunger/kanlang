<script>
  // @ts-ignore
  import * as kanlang from "kanlang";
  import Editor from "./editor.svelte";
  console.log(kanlang);
  let kanlangExample = `          
fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
    num fahrenheit = celsius * 9 / 5 + 32
    return fahrenheit
}
Celsius c = 100
Fahrenheit f
fn main() DI alias num {
    return f
}`;
  // @ts-ignore
  function compile(input) {
    try {
      return new kanlang.KanlangCompiler().feed(input).code;
    } catch (e) {
      return JSON.stringify(e);
    }
  }
  $: jsOutput = compile(kanlangExample);
</script>

<div id="container">
  <div>
    <Editor bind:code={kanlangExample} language="kanlang" />
  </div>
  <div>
    <Editor code={jsOutput || ""} listen />
  </div>
</div>

<style>
  #container {
    display: flex;
    flex-direction: row;
    height: 100%;
  }
  #container > div {
    flex: 1;
  }
</style>
