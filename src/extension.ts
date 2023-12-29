import * as vscode from "vscode";
import * as cppcheck from "./cppcheck";

function checkFile(fileUri: vscode.Uri,
  logChannel: vscode.OutputChannel,
  diagnostics: vscode.DiagnosticCollection) {
  const command = cppcheck.makeCppcheckCommand(fileUri.fsPath);
  cppcheck.runCppcheck(command, logChannel).then(
    (data: string) => {
      diagnostics.delete(fileUri);
      diagnostics.set(fileUri, cppcheck.parseIssues(data));
    },
    () => {
      logChannel.appendLine("Failed");
    },
  );
}

export function activate(context: vscode.ExtensionContext) {
  const { subscriptions } = context;
  const diagnostics = vscode.languages.createDiagnosticCollection("Cppcheck");
  subscriptions.push(diagnostics);
  const logChannel = vscode.window.createOutputChannel("Cppcheck");
  subscriptions.push(logChannel);

  // async function checkWholeProject() {
  //   diagnostics.clear();
  //   const diagnosticList = await lintWholeProject(logChannel);
  //   diagnostics.set(diagnosticList);
  // }

  // context.subscriptions.push(
  /* eslint-disable max-len */
  //   vscode.commands.registerCommand('cppcheck.scanProject', checkWholeProject))
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document) => {
      checkFile(document.uri, logChannel, diagnostics);
    }));
  // context.subscriptions.push(
  //   vscode.workspace.onDidSaveTextDocument(checkWholeProject));
  // context.subscriptions.push(
  //   vscode.workspace.onDidChangeConfiguration((config) => {
  //     if (config.affectsConfiguration('cppcheck')) {
  //       checkWholeProject();
  //     }
  //   }));
}
