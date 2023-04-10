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

  it("can save values in variables", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
num fahrenheit = celsius * 9 / 5 + 32
return fahrenheit
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

  it("throws errors when there is duplicate variable declaration", () => {
    expect(() => {
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
num fahrenheit = celsius * 9 / 5 + 32
num fahrenheit = 2 + 2
return fahrenheit
}`);
    }).toThrow();
  });

  it("allows leading indentations on code blocks", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
        num fahrenheit = celsius * 9 / 5 + 32
        return fahrenheit
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
  })
  it("supports code comments", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
        //assign fahrenheit
        num fahrenheit = celsius * 9 / 5 + 32
        return fahrenheit //is in scope, can be returned
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
  })
});
