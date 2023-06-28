// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { DatabaseProvider } from './tree-view';
import { establishConnection } from './db-conn';
import { SampleContentSerializer } from './serializer';
import { SampleKernel } from './controller';

const NOTEBOOK_TYPE = 'sql-notebook';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

	const connection = await establishConnection();

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-sql" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('vscode-sql.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from vscode-sql!');
	});

	let addConnectionCommand =  vscode.commands.registerCommand('vscode-sql.addConnection', () => {
		vscode.window.showInformationMessage('add connection');
	});

	// create tree view with DatabaseProvider as data provider

	vscode.window.createTreeView('databaseExplorer', {
		treeDataProvider: new DatabaseProvider(connection)
	});

	context.subscriptions.push(vscode.commands.registerCommand('vscode-sql.createSqlNotebook', async () => {
		const language = 'sql';
		const defaultValue = `select * from users`;
		const cell = new vscode.NotebookCellData(vscode.NotebookCellKind.Code, defaultValue, language);
		const data = new vscode.NotebookData([cell]);
		data.metadata = {
			custom: {
				cells: [],
				metadata: {
					orig_nbformat: 4
				},
				nbformat: 4,
				nbformat_minor: 2
			}
		};
		const doc = await vscode.workspace.openNotebookDocument(NOTEBOOK_TYPE, data);
		await vscode.window.showNotebookDocument(doc);
	}));

	context.subscriptions.push(
		vscode.workspace.registerNotebookSerializer(
			NOTEBOOK_TYPE, new SampleContentSerializer(), { transientOutputs: true }
		),
		new SampleKernel()
	);



	context.subscriptions.push(disposable);
	context.subscriptions.push(addConnectionCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
