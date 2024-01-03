# Contributing to VS Code Cppcheck

## NPM Scripts

The [_package.json_](/package.json) file defines some scripts for common development tasks.
You can use them on the command line with the command

```bash
npm run <script>
```

The [_.vscode/tasks.json_](/.vscode/tasks.json) file defines VS Code tasks that correspond to the NPM scripts.
You can run a task in VS Code by using `Tasks: Run Task` from the Code command palette.

This table lists the NPM scripts and the corresponding Code tasks.

<!-- prettier-ignore -->
| Script Name | VS Code Task  | Purpose |
| :---------- | :------------ | :------ |
| compile     | `VC: Compile` | Run the TypeScript compiler on the extension and the test files. |
| format      | `VC: Format`  | Run [Prettier](https://prettier.io) to format the TypeScript, Markdown, YAML, and JSON files. |
| lint        | `VS: Lint`    | Run [ESLint](https://eslint.org/) on the the Typescript files. |
| unitTests   | `VC: Test`    | Run the unit tests. The VS Code task will automatically run the `VC: Compile` task, first. |

> [!TIP]  
> If you use VS Code, there are tasks to emulate the CI/CT workflows.
> In the command palette, select `Run Task`.
> The tasks are prefixed with "VC:".
> The "VC: Pipeline" task runs all the other tasks.
