import { KanlangCompiler } from "./";

describe("KanlangCompiler", () => {
  let compiler: KanlangCompiler;

  beforeEach(() => {
    compiler = new KanlangCompiler();
  });

  describe("builtins", () => {
    it("can print to the console", () => {
      const result = compiler.feed("print 43").code;
      console.log = jest.fn();
      eval(result);
      expect(console.log).toHaveBeenCalledWith(43);
    });
  });

  it("write a function for celsius to fahrenheit", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
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
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
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
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
num fahrenheit = celsius * 9 / 5 + 32
num fahrenheit = 2 + 2
return fahrenheit
}`);
    }).toThrow();
  });

  it("allows leading indentations on code blocks", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
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
  it("supports code comments", () => {
    const result =
      compiler.feed(`fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
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
  });
  describe("typesystem", () => {
    it("throws errors when there are undefined types", () => {
      expect(() => {
        compiler.feed(`fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
        return celsius * 9 / 5 + 32
        }`);
      }).toThrow();
    });
    it("throws errors when there is a type override", () => {
      expect(() => {
        compiler.feed(`Celsius alias num
        Celsius alias num`);
      }).toThrow();
    });
    it("does not need to inline declare type aliases", () => {
      const result = compiler.feed(`
        Celsius alias num
        fn celsiusToFahrenheit(celsius Celsius) Fahrenheit alias num {
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
        expect(eval(result + `celsiusToFahrenheit(${celsius})`)).toBe(
          fahrenheit
        );
      });
    });
    it("cannot declare the same function twice", () => {
      expect(() => {
        compiler.feed(`
        fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }
        
        fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }`);
      }).toThrow();
    });
    it("cannot declare two functions with the same return", () => {
      expect(() => {
        compiler.feed(`
        Celsius alias num
        Fahrenheit alias num
        fn celsiusToFahrenheit(celsius Celsius) Fahrenheit {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }
        
        fn toFahrenheit(celsius Celsius) Fahrenheit {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }`);
      }).toThrow();
    });
    it("can declare type before usage in function return", () => {
      const result = compiler.feed(`
        Celsius alias num
        Fahrenheit alias num
        fn celsiusToFahrenheit(celsius Celsius) Fahrenheit{
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
        expect(eval(result + `celsiusToFahrenheit(${celsius})`)).toBe(
          fahrenheit
        );
      });
    })
    describe("DI", () => {
      it("can inject values based on type", () => {
        const result = compiler.feed(`
          fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
            num fahrenheit = celsius * 9 / 5 + 32
            return fahrenheit
          }
          Celsius c = 100
          Fahrenheit f
          fn main() DI alias num {
            return f
          }
          `).code;
        expect(eval(result + `main()`)).toBe(212);
      });
    });
    it("can invoke functions directly without parenthesis", () => {
      const result = compiler.feed(`
        fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }
        Celsius c = 100
        Fahrenheit f = celsiusToFahrenheit c
        fn main() DI alias num {
          return f
        }
        `).code;
      expect(eval(result + `main()`)).toBe(212);
    });
    it("can handle infix function calls", () => {
      const result = compiler.feed(`
        fn asFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }
        Celsius c = 100
        Fahrenheit f = c asFahrenheit
        fn main() DI alias num {
          return f
        }
        `).code;
      expect(eval(result + `main()`)).toBe(212);
    });
    it("can invoke functions directly with parenthesis", () => {
      const result = compiler.feed(`
        fn celsiusToFahrenheit(celsius Celsius alias num) Fahrenheit alias num {
          num fahrenheit = celsius * 9 / 5 + 32
          return fahrenheit
        }
        Celsius c = 100
        Fahrenheit f = celsiusToFahrenheit(c)
        fn main() DI alias num {
          return f
        }
        `).code;
      expect(eval(result + `main()`)).toBe(212);
    });
  });
});
