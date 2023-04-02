import { KanlangCompiler } from "./";

describe("KanlangCompiler", () => {
  let compiler: KanlangCompiler;

  beforeEach(() => {
    compiler = new KanlangCompiler();
  });

  it("write a function for celsius to fahrenheit", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
return celsius * 9 / 5 + 32
}`).code;
    let conversionMap = [
      [0, 32],
      [100, 212],
      [37, 98.6],
      [20, 68],
      [10, 50],
    ];
    conversionMap.forEach(([celsius, fahrenheit]) => {
      expect(eval(result + `celsiusToFahrenheit(${celsius})`)).toBe(fahrenheit);
    });
  });
});
