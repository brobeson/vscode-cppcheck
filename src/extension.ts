import * as vscode from 'vscode';
import { lint_whole_project } from './cppcheck';

export function activate(context: vscode.ExtensionContext) {
  let subscriptions = context.subscriptions;
  let diagnostics = vscode.languages.createDiagnosticCollection('Cppcheck');
  subscriptions.push(diagnostics);
  let log_channel = vscode.window.createOutputChannel('Cppcheck');
  subscriptions.push(log_channel);

  async function check_whole_project() {
    const diagnostic_list = await lint_whole_project(log_channel);
    diagnostics.set(diagnostic_list);
  }

  context.subscriptions.push(
    vscode.commands.registerCommand('cppcheck.scanProject', check_whole_project));
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(check_whole_project));
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(config => {
      if (config.affectsConfiguration('cppcheck')) {
        check_whole_project();
      }
    }));
}

export function deactivate() { }
