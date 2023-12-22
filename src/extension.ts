import * as vscode from "vscode";
import * as cppcheck from "./cppcheck";

function checkFile(fileName: string, logChannel: vscode.OutputChannel) {
  const command = cppcheck.makeCppcheckCommand(fileName);
  cppcheck.runCppcheck(command, logChannel).then(
    () => {
      logChannel.appendLine("Done");
    },
    () => {
      logChannel.appendLine("Failed");
    }
  );
}

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
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
      checkFile(document.fileName, logChannel);
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
