import * as assert from "assert";
import * as cppcheck from "../src/cppcheck";

describe("Cppcheck", () => {
  it("should create the correct command", () => {
    assert.deepEqual(cppcheck.makeCppcheckCommand("file.cpp"), [
      "cppcheck",
      "--enable=all",
      "file.cpp",
    ]);
  });
});
