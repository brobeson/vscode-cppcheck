/* eslint-disable capitalized-comments,max-len */
// import { spawn } from 'child_process';
// import { readFileSync } from 'fs';
// import * as vscode from 'vscode';

/*
export async function lint_whole_project(log_channel: vscode.OutputChannel) {
  return create_diagnostics_for_all_output(await run_cppcheck(undefined, log_channel));
}

export async function lint_active_document(
  log_channel: vscode.OutputChannel) {
  if (vscode.window.activeTextEditor === undefined) {
    return { document: undefined, diagnostics: [] };
  }
  return await lint_document(
    vscode.window.activeTextEditor.document,
    log_channel);
}

export async function lint_document(
  file: vscode.TextDocument,
  log_channel: vscode.OutputChannel) {
  if (!['c', 'cpp'].includes(file.languageId) || file.uri.scheme !== 'file') {
    return [];
  }
  return create_diagnostics_for_all_output(await run_cppcheck(file.uri.fsPath, log_channel));
}

function run_cppcheck(
  file_path: string | undefined,
  log_channel: vscode.OutputChannel): Promise<string> {
  return new Promise((resolve, reject) => {
    const command_arguments = make_cppcheck_command(file_path);
    const cppcheck = "cppcheck";
    log_channel.appendLine(`> ${cppcheck} ${command_arguments.join(' ')}`);

    const working_directory: string = vscode.workspace.workspaceFolders === undefined
      ? ""
      : vscode.workspace.workspaceFolders[0].uri.fsPath;
    const process = spawn(cppcheck, command_arguments, { "cwd": working_directory });
    if (process.pid) {
      let stderr = "";
      process.stdout.on("data", data => {
        log_channel.appendLine(data);
      });
      process.stderr.on("data", data => {
        log_channel.appendLine(data);
        stderr += data;
      });
      process.stderr.on("end", () => {
        resolve(stderr);
      });
      process.on("error", err => {
        log_channel.appendLine(err.message);
        reject(err);
      });
    }
    else {
      log_channel.appendLine("Failed to run Cppcheck.");
    }
  });
}
*/

/**
 * Get the Cppcheck command.
 * @param file The path to a specific file to check.
 * @returns An array of strings. The 0th element is the Cppcheck command. The
 * remaining elements are the command arguments.
 */
export function makeCppcheckCommand(file?: string) {
  const commandArguments = ["cppcheck", "--enable=all"];
  // const configuration = vscode.workspace.getConfiguration("cppcheck");
  // if (configuration.has("commandArguments")) {
  //   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //   commandArguments = configuration.get("commandArguments")!;
  // }
  // commandArguments = commandArguments.filter((argument) => !argument.startsWith("--template"));
  // commandArguments.push("--template={file}-:-{line}-:-{column}-:-{severity}-:-{id}-:-{message}");
  if (file) {
    commandArguments.push(file);
  }
  return commandArguments;
}

/*
function create_diagnostics_for_all_output(process_output: string) {
  const lines = process_output.trim().split('\n');
  let diagnostics = [];
  for (const line of lines) {
    if (line.startsWith("nofile")) {
      vscode.window.showWarningMessage(line.replace(/.*-:-/, ""));
    } else {
      const elevation: string = vscode.workspace.getConfiguration("cppcheck").get("elevateSeverity") as string;
      diagnostics.push(create_diagnostic_for_one_line(line, elevation));
    }
  }
  return diagnostics;
}

function extract_function_name(cppcheck_message: string): string {
  if (cppcheck_message.startsWith("The function '")) {
    const index = cppcheck_message.indexOf("'", 14);
    if (index === undefined) {
      return "";
    }
    return cppcheck_message.substr(14, index - 14);
  }
  return "";
}

function create_diagnostic_for_one_line(line: string, elevation: string): [vscode.Uri, vscode.Diagnostic[]] {
  const details = line.split("-:-");
  const function_name = extract_function_name(details[5]);
  const line_index = Math.max(0, parseInt(details[1]) - 1);
  const column_index = Math.max(0, parseInt(details[2]) - 1);
  const code_line = readFileSync(details[0], "utf-8").split("\n")[line_index];
  let diagnostic = new vscode.Diagnostic(
    get_function_range(line_index, column_index, function_name, code_line),
    details[5],
    cppcheck_severity_to_vscode_severity(details[3], elevation)
  );
  diagnostic.code = `${details[4]}`;
  diagnostic.source = "Cppcheck";
  return [vscode.Uri.file(details[0]), [diagnostic]];
}

function cppcheck_severity_to_vscode_severity(cppcheck_severity: string, elevation: string): vscode.DiagnosticSeverity {
  if (cppcheck_severity === "error" || elevation === "error") {
    return vscode.DiagnosticSeverity.Error;
  }
  if (cppcheck_severity === "warning" || elevation === "warning") {
    return vscode.DiagnosticSeverity.Warning;
  }
  return vscode.DiagnosticSeverity.Information;
}

function get_function_range(
  line_index: number,
  column_index: number,
  function_name: string,
  code_line: string): vscode.Range {
  if (function_name === "") {
    return new vscode.Range(line_index, column_index, line_index, column_index);
  }
  const start_character = code_line.indexOf(function_name);
  if (start_character < 0) {
    return new vscode.Range(line_index, column_index, line_index, column_index);
  }
  return new vscode.Range(
    line_index,
    start_character,
    line_index,
    start_character + function_name.length);
}
*/
