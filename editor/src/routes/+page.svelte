<script>
  // @ts-nocheck
  import * as kanlang from "kanlang";
  const { KanlangCompiler } = kanlang;
  import Editor from "./editor.svelte";
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
      return new KanlangCompiler().feed(input).code;
    } catch (e) {
      return JSON.stringify(e);
    }
  }
  $: jsOutput = compile(kanlangExample);
</script>

<div>
  <h1>Kanlang Editor</h1>
  <p>This is a simple editor for the Kanlang programming language.</p>
  <p>It is only meant as a pre MVP test.</p>
  <p>
    On the left you have your kanlang code, and on the right you have the
    compiled javascript
  </p>
  <p>
    This is far from done or even working, but I welcome you to play with it
  </p>
  <p>
    Read more about it on <a href="https://github.com/munHunger/kanlang"
      >github</a
    >
  </p>
</div>
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
