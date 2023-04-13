module.exports = {
  preset: "ts-jest/presets/js-with-ts",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  globals: {},
  transformIgnorePatterns: ["node_modules/(?!troublesome-dependency/.*)"],
};
