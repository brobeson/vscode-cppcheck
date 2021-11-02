import { spawn } from 'child_process';
import { readFileSync } from 'fs';
import { get } from 'https';
import * as vscode from 'vscode';
import { MessageChannel } from 'worker_threads';

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

export async function lint_whole_project(log_channel: vscode.OutputChannel) {
  return create_diagnostics_for_all_output(await run_cppcheck(undefined, log_channel));
}

export async function lint_active_document(
  working_directory: string,
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

// function extract_exception_message(process_output: string): string {
//   const lines = process_output.trim().split('\n');
//   return lines[lines.length - 1];
// }

function make_cppcheck_command(file: string | undefined) {
  let command_arguments: string[] = [];
  const configuration = vscode.workspace.getConfiguration("cppcheck");
  if (configuration.has("commandArguments")) {
    command_arguments = configuration.get("commandArguments") as string[];
  }
  command_arguments = command_arguments.filter(argument => !argument.startsWith("--template"));
  command_arguments.push("--template={file}-:-{line}-:-{column}-:-{severity}-:-{id}-:-{message}");
  if (file !== undefined) {
    command_arguments.push(file);
  }
  return command_arguments;
}

function create_diagnostics_for_all_output(process_output: string) {
  const lines = process_output.trim().split('\n');
  let diagnostics = [];
  // let diagnostics = new ReadOnlyArray<
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

// class Details {
//   readonly full_function_name: string; // Function name with namespaces.
//   readonly function_name: string; // Function name without namespaces.
//   readonly line_number: number;
//   readonly ccn: number;
//   readonly length: number;
//   readonly arguments: number;
//   constructor(full_function_name: string, line_number: number, ccn: number, length: number, parameters: number) {
//     this.full_function_name = full_function_name;
//     this.function_name = extract_function_name(full_function_name);
//     this.line_number = line_number;
//     this.ccn = ccn;
//     this.length = length;
//     this.arguments = parameters;
//   }
// }

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
  // let diagnostics: vscode.Diagnostic[] = [];
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

function cppcheck_severity_to_vscode_severity(cppcheck_severity: string, elevation: string): vscode.DiagnosticSeverity {
  if (cppcheck_severity === "error" || elevation === "error") {
    return vscode.DiagnosticSeverity.Error;
  }
  if (cppcheck_severity === "warning" || elevation === "warning") {
    return vscode.DiagnosticSeverity.Warning;
  }
  return vscode.DiagnosticSeverity.Information;
}

// function create_ccn_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
//   return new vscode.Diagnostic(
//     details.function_name === "*global*"
//       ? new vscode.Range(0, 0, file.lineCount, 0)
//       : get_function_range(details, file),
//     details.function_name === "*global*"
//       ? `The global scope has ${details.ccn} CCN; the maximum is ${limit}.`
//       : `${details.function_name} has ${details.ccn} CCN; the maximum is ${limit}.`,
//     vscode.DiagnosticSeverity.Warning);
// }

// function create_length_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
//   return new vscode.Diagnostic(
//     details.function_name === "*global*"
//       ? new vscode.Range(0, 0, file.lineCount, 0)
//       : get_function_range(details, file),
//     details.function_name === "*global*"
//       ? `The global scope has ${details.length} length; the maximum is ${limit}.`
//       : `${details.function_name} has ${details.length} length; the maximum is ${limit}.`,
//     vscode.DiagnosticSeverity.Warning);
// }

// function create_parameters_diagnostic(details: Details, file: vscode.TextDocument, limit: number) {
//   return new vscode.Diagnostic(
//     details.function_name === "*global*"
//       ? new vscode.Range(0, 0, file.lineCount, 0)
//       : get_function_range(details, file),
//     details.function_name === "*global*"
//       ? `The global scope has ${details.arguments} parameters; the maximum is ${limit}.`
//       : `${details.function_name} has ${details.arguments} parameters; the maximum is ${limit}.`,
//     vscode.DiagnosticSeverity.Warning);
// }

// function extract_details(line: string): Details {
//   return new Details(
//     line.split("-:-")[2],
//     parseInt(line.split(":")[1]) - 1,cppcheck
//     extract_value(line, /[0-9]+ CCN/),
//     extract_value(line, /[0-9]+ length/),
//     extract_value(line, /[0-9]+ PARAM/)
//   );
// }

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

// function extract_value(text: string, parameter_regex: RegExp) {
//   let matches = text.match(parameter_regex);
//   if (matches === null) {
//     return 0;
//   }
//   return parseInt(matches[0].split(' ')[0]);
// }
