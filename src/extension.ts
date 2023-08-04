import * as vscode from "vscode";
// Import { lint_whole_project } from './cppcheck';

export function activate(context: vscode.ExtensionContext) {
  const { subscriptions } = context;
  const diagnostics = vscode.languages.createDiagnosticCollection("Cppcheck");
  subscriptions.push(diagnostics);
  const logChannel = vscode.window.createOutputChannel("Cppcheck");
  subscriptions.push(logChannel);

  // Function checkWholeProject() {
  //   diagnostics.clear();
  //   // Const diagnosticList = await lintWholeProject(logChannel);
  //   // Diagnostics.set(diagnosticList);
  // }

  // Context.subscriptions.push(
  // vscode.commands.registerCommand('cppcheck.scanProject', checkWholeProject))
  // context.subscriptions.push(
  //   vscode.workspace.onDidSaveTextDocument(checkWholeProject));
  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeConfiguration((config) => {
  //     if (config.affectsConfiguration('cppcheck')) {
  //       checkWholeProject();
  //     }
  //   }));
}
