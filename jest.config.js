const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/src/**/*.test.[jt]s?(x)"],
};

module.exports = createJestConfig(customJestConfig);
