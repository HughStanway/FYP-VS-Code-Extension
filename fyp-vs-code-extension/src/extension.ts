import * as vscode from 'vscode';
import { Sidebar } from './sidebar';

export function activate(context: vscode.ExtensionContext) {

	// Register the Sidebar Panel as a webview
	const sidebarProvider = new Sidebar(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"code-search-sidebar",
			sidebarProvider
		)
	);
}

export function deactivate() { }