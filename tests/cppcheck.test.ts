import * as assert from "assert";
import * as cppcheck from "../src/cppcheck";

describe("Cppcheck", () => {
  it("should create the correct command", () => {
    assert.deepEqual(cppcheck.makeCppcheckCommand("file.cpp"), [
      "cppcheck",
      "--enable=all",
      "--template='{\"file\":\"{file}\",\"line\":{line},\"column\":{column},\"severity\":\"{severity}\",\"message\":\"{message}\",\"id\":\"{id}\"}'",
      "file.cpp",
    ]);
  });

  it("should correctly parse one output line", () => {
    // eslint-disable-next-line max-len
    // cppcheck.parseCppcheckIssue("{\"file\":\"unit_tests/training_metadata_test.cpp\",\"line\":64,\"column\":0,\"severity\":\"style\",\"message\":\"The function 'load_training_scores_data' is never used.\",\"id\":\"unusedFunction\"}");
  });

  describe("converting known Cppcheck severities", () => {
    it("should return the correct VS Code severity", () => {
      assert.deepStrictEqual(cppcheck.toDiagnosticSeverity("error"), "error");
    });
  });
});
