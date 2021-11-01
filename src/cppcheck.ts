import { spawn } from 'child_process';
import * as vscode from 'vscode';

// export class Configuration {
//   readonly ccn: number;
//   readonly length: number;
//   readonly arguments: number;
//   readonly modified: boolean;
//   readonly whitelist: string;
//   readonly extensions: string[];
//   constructor(ccn: number,
//     length: number,
//     parameters: number,
//     modified: boolean,
//     whitelist: string,
//     extensions: string[]) {
//     this.ccn = ccn;
//     this.length = length;
//     this.arguments = parameters;
//     this.modified = modified;
//     this.whitelist = whitelist;
//     this.extensions = extensions;
//   }
// }

export async function lint_active_document(
  working_directory: string,
  log_channel: vscode.OutputChannel) {
  if (vscode.window.activeTextEditor === undefined) {
    return { document: undefined, diagnostics: [] };
  }
  return await lint_document(
    vscode.window.activeTextEditor.document,
    working_directory,
    log_channel);
  // return {
  //   document: vscode.window.activeTextEditor.document,
  //   diagnostics: await lint_document(
  //     vscode.window.activeTextEditor.document,
  //     working_directory,
  //     log_channel)
  // };
}

export async function lint_document(
  file: vscode.TextDocument,
  working_directory: string,
  log_channel: vscode.OutputChannel) {
  if (!['c', 'cpp'].includes(file.languageId) || file.uri.scheme !== 'file') {
    return [];
  }
  let diags = create_diagnostics_for_all_output(
    await run_cppcheck(file.uri.fsPath, working_directory, log_channel),
    file);
  return diags;
}

function run_cppcheck(
  file_path: string,
  working_directory: string,
  log_channel: vscode.OutputChannel): Promise<string> {
  return new Promise((resolve, reject) => {
    const command_arguments = make_cppcheck_command(file_path);
    const cppcheck = "cppcheck";
    log_channel.appendLine(`> ${cppcheck} ${command_arguments.join(' ')}`);
    log_channel.show();

    const process = spawn(cppcheck, command_arguments, { "cwd": working_directory });
    if (process.pid) {
      let stdout = "";
      let stderr = "";
      process.stdout.on("data", data => {
        log_channel.appendLine(data);
        // stdout += data;
      });
      // process.stdout.on("end", () => {
      //   // log_channel.appendLine(stdout);
      //   resolve(stdout);
      // });
      process.stderr.on("data", data => {
        log_channel.appendLine(data);
        stderr += data;
      });
      process.stderr.on("end", () => {
        resolve(stderr);
        // if (stderr.length > 0) {
        //   const exception_message = extract_exception_message(stderr);
        //   vscode.window.showErrorMessage(
        //     `Cppcheck failed; here's the exception message:\n${exception_message}`);
        // }
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

function extract_exception_message(process_output: string): string {
  const lines = process_output.trim().split('\n');
  return lines[lines.length - 1];
}

function make_cppcheck_command(file: string | undefined) {
  // TODO Make these settings for the extension.
  let command_arguments: string[] = ["--enable=all",
    "--project=../build/compile_commands.json",
    "--template={file}-:-{line}-:-{column}-:-{severity}-:-{id}-:-{message}",
    "--quiet"
  ];
  // const configuration = vscode.workspace.getConfiguration("cppcheck");
  // if (configuration.has("project") && configuration.get()) {
  //   command_arguments.push(`--project=${configuration.get("project")}`)
  // }
  // if (limits.modified) {
  //   command_arguments.push("--modified");
  // }
  // if (limits.ccn !== 0) {
  //   command_arguments.push(`--CCN=${limits.ccn}`);
  // }
  // if (limits.length !== 0) {
  //   command_arguments.push(`--length=${limits.length}`);
  // }
  // if (limits.arguments !== 0) {
  //   command_arguments.push(`--arguments=${limits.arguments}`);
  // }
  // if (limits.whitelist !== "") {
  //   command_arguments.push(`--whitelist=${limits.whitelist}`);
  // }
  // for (const extension of limits.extensions) {
  //   command_arguments.push(`--extension=${extension}`);
  // }
  if (file !== undefined) {
    command_arguments.push(file);
  }
  return command_arguments;
}

function create_diagnostics_for_all_output(process_output: string, file: vscode.TextDocument) {
  const lines = process_output.trim().split('\n');
  let diagnostics = [];
  // let diagnostics = new ReadOnlyArray<
  for (const line of lines) {
    if (line.startsWith("(information)")) {
      vscode.window.showWarningMessage(line.replace("(information) ", ""));
    } else {
      diagnostics.push(create_diagnostic_for_one_line(line, file));
    }
  }
  return diagnostics;
}

class Details {
  readonly full_function_name: string; // Function name with namespaces.
  readonly function_name: string; // Function name without namespaces.
  readonly line_number: number;
  readonly ccn: number;
  readonly length: number;
  readonly arguments: number;
  constructor(full_function_name: string, line_number: number, ccn: number, length: number, parameters: number) {
    this.full_function_name = full_function_name;
    this.function_name = extract_function_name(full_function_name);
    this.line_number = line_number;
    this.ccn = ccn;
    this.length = length;
    this.arguments = parameters;
  }
}

function extract_function_name(full_function_name: string): string {
  if (full_function_name === "*global*") {
    return full_function_name;
  }
  const index = full_function_name.lastIndexOf(":");
  if (index === undefined) {
    return full_function_name;
  }
  return full_function_name.substr(index + 1);
}

function create_diagnostic_for_one_line(line: string, file: vscode.TextDocument): [vscode.Uri, vscode.Diagnostic[]] {
  // let diagnostics: vscode.Diagnostic[] = [];
  const details = line.split("-:-");
  const line_number = parseInt(details[1]);
  const column = parseInt(details[2]);
  let diagnostic = new vscode.Diagnostic(
    new vscode.Range(
      line_number > 0 ? line_number - 1 : line_number,
      column > 0 ? column - 1 : column,
      line_number > 0 ? line_number - 1 : line_number,
      column > 0 ? column - 1 : column),
    details[5],
    cppcheck_severity_to_vscode_severity(details[3])
  );
  diagnostic.code = `${details[4]}`;
  diagnostic.source = "Cppcheck";
  return [vscode.Uri.file(details[0]), [diagnostic]];
  // if (limits.ccn !== undefined && details.ccn > limits.ccn) {
  //   diagnostics.push(create_ccn_diagnostic(details, file, limits.ccn));
  // }
  // if (limits.length !== undefined && details.length > limits.length) {
  //   diagnostics.push(create_length_diagnostic(details, file, limits.length));
  // }
  // if (limits.arguments !== undefined && details.arguments > limits.arguments) {
  //   diagnostics.push(create_parameters_diagnostic(details, file, limits.arguments));
  // }
  // return diagnostics;
}

function cppcheck_severity_to_vscode_severity(cppcheck_severity: string): vscode.DiagnosticSeverity {
  if (cppcheck_severity === "error") {
    return vscode.DiagnosticSeverity.Error;
  }
  if (cppcheck_severity === "warning") {
    return vscode.DiagnosticSeverity.Warning;
  }
  return vscode.DiagnosticSeverity.Information;
}

function create_ccn_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
  return new vscode.Diagnostic(
    details.function_name === "*global*"
      ? new vscode.Range(0, 0, file.lineCount, 0)
      : get_function_range(details, file),
    details.function_name === "*global*"
      ? `The global scope has ${details.ccn} CCN; the maximum is ${limit}.`
      : `${details.function_name} has ${details.ccn} CCN; the maximum is ${limit}.`,
    vscode.DiagnosticSeverity.Warning);
}

function create_length_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
  return new vscode.Diagnostic(
    details.function_name === "*global*"
      ? new vscode.Range(0, 0, file.lineCount, 0)
      : get_function_range(details, file),
    details.function_name === "*global*"
      ? `The global scope has ${details.length} length; the maximum is ${limit}.`
      : `${details.function_name} has ${details.length} length; the maximum is ${limit}.`,
    vscode.DiagnosticSeverity.Warning);
}

function create_parameters_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
  return new vscode.Diagnostic(
    details.function_name === "*global*"
      ? new vscode.Range(0, 0, file.lineCount, 0)
      : get_function_range(details, file),
    details.function_name === "*global*"
      ? `The global scope has ${details.arguments} parameters; the maximum is ${limit}.`
      : `${details.function_name} has ${details.arguments} parameters; the maximum is ${limit}.`,
    vscode.DiagnosticSeverity.Warning);
}

function extract_details(line: string): Details {
  return new Details(
    line.split("-:-")[2],
    parseInt(line.split(":")[1]) - 1,
    extract_value(line, /[0-9]+ CCN/),
    extract_value(line, /[0-9]+ length/),
    extract_value(line, /[0-9]+ PARAM/)
  );
}

function get_function_range(details: Details, file: vscode.TextDocument): vscode.Range {
  const line_text = file.lineAt(details.line_number).text;
  const start_character = line_text.lastIndexOf(details.function_name);
  if (start_character >= line_text.length) {
    return new vscode.Range(details.line_number, 0, details.line_number, 0);
  }
  const range = file.getWordRangeAtPosition(
    new vscode.Position(details.line_number, start_character),
    RegExp(details.function_name));
  if (range === undefined) {
    return new vscode.Range(details.line_number, 0, details.line_number, 0);
  }
  return range;
}

function extract_value(text: string, parameter_regex: RegExp) {
  let matches = text.match(parameter_regex);
  if (matches === null) {
    return 0;
  }
  return parseInt(matches[0].split(' ')[0]);
}
