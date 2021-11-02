import * as vscode from 'vscode';
import { lint_active_document, lint_document, lint_whole_project } from './cppcheck';

export function activate(context: vscode.ExtensionContext) {
  let subscriptions = context.subscriptions;
  let diagnostics = vscode.languages.createDiagnosticCollection('Cppcheck');
  subscriptions.push(diagnostics);
  let log_channel = vscode.window.createOutputChannel('Cppcheck');
  subscriptions.push(log_channel);

  // async function lizard_document(file: vscode.TextDocument) {
  //   if (vscode.workspace.workspaceFolders === undefined) {
  //     return;
  //   }
  //   const diag = await lint_document(file, log_channel);
  //   // diagnostics.set(file.uri, diag);
  // }

  // async function check_active_document() {
  //   if (vscode.window.activeTextEditor === undefined
  //     || vscode.workspace.workspaceFolders === undefined) {
  //     return;
  //   }
  //   const diag = await lint_active_document(
  //     vscode.workspace.workspaceFolders[0].uri.fsPath,
  //     log_channel);
  //   // if (diag.document) {
  //   //   diagnostics.set(diag.document.uri, diag.diagnostics);
  //   // }
  //   // @ts-ignore
  //   diagnostics.set(diag);
  // }

  async function check_whole_project() {
    const diagnostic_list = await lint_whole_project(log_channel);
    diagnostics.set(diagnostic_list);
  }

  // List of events that can't be used:
  // - onDidChangeTextDocument: Cppcheck reads the file from disk; it must be
  //   saved first.
  // TODO Can Cppcheck lint the document before saving?
  context.subscriptions.push(
    vscode.commands.registerCommand('cppcheck.scanProject', check_whole_project));
  // context.subscriptions.push(
  //   vscode.workspace.onDidOpenTextDocument(check_active_document));
  // context.subscriptions.push(
  //   vscode.workspace.onDidSaveTextDocument(check_active_document));
  // context.subscriptions.push(
  //   vscode.workspace.onDidCloseTextDocument(doc => diagnostics.delete(doc.uri)));
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(config => {
      if (config.affectsConfiguration('cppcheck')) {
        check_whole_project();
      }
    }));
}

// function read_limits(): Configuration {
//   const configuration = vscode.workspace.getConfiguration("lizard");
//   return new Configuration(
//     configuration.has("ccn")
//       ? configuration.get("ccn") as number : 0,
//     configuration.has("length")
//       ? configuration.get("length") as number : 0,
//     configuration.has("arguments")
//       ? configuration.get("arguments") as number : 0,
//     configuration.has("modified")
//       ? configuration.get("modified") as boolean : false,
//     configuration.has("whitelist")
//       ? configuration.get("whitelist") as string : "",
//     configuration.has("extensions")
//       ? configuration.get("extensions") as string[] : []);
// }

export function deactivate() { }