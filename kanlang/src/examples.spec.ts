import { KanlangCompiler } from "./";
import { promises as fs } from "fs";

describe("KanlangCompiler", () => {
  let compiler: KanlangCompiler;

  beforeEach(() => {
    compiler = new KanlangCompiler();
  });

  describe("Advent of code", () => {
    it("runs 1", async () => {
      let code = await fs.readFile(
        __dirname + "/../../examples/1/calorieCounter.kan",
        "utf-8"
      );
      const result = compiler.feed(code).code;
      console.log = jest.fn();
      eval(result);
      expect(console.log).toHaveBeenCalledWith(43);
    });
  });
});
