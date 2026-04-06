import { test } from "@jest/globals";
import { toAPYText, toSPYWAI } from "../utils/convertors";

test("calculate APY text", () => {
  expect(toAPYText("1000000076036763191")).toBe("1000.00%");
  expect(toAPYText("1000000076036763000")).toBe("1000.00%");
});

test("calculate SPY WAI", () => {
  expect(toSPYWAI(10).toString()).toBe("1000000076036763000");
});
