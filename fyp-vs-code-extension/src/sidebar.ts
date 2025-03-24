import { query, create, insert } from './request';

import * as vscode from "vscode";

export class Sidebar implements vscode.WebviewViewProvider {
  public static readonly viewType = "vscodeSidebar.openview";

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext<unknown>,
    token: vscode.CancellationToken
): void {
    this._view = webviewView;

    webviewView.webview.options = {
        enableScripts: true,
        localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this.getHtmlContent(webviewView.webview);
    webviewView.webview.postMessage({ command: 'showOriginal' });

    webviewView.webview.onDidReceiveMessage(
        async (message) => {
            if (message.command === "query") {             
                // Show loading view
                this._view?.webview.postMessage({ command: 'showLoading' });
    
                try {
                    await vscode.window.withProgress(
                        {
                            location: vscode.ProgressLocation.Notification,
                            title: "Searching...",
                            cancellable: false
                        },
                        async (progress) => {
                            const result = await setupQuery(message.inputText);
                            this._view?.webview.postMessage({ 
                                command: 'showResults', 
                                data: result 
                            });
                        }
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    vscode.window.showInformationMessage(`Code Search Error: ${errorMessage}`);
                    this._view?.webview.postMessage({ command: 'showOriginal' });
                }
            } else if (message.command === "create") {
                try {
                    await vscode.window.withProgress(
                        {
                            location: vscode.ProgressLocation.Notification,
                            title: "Creating collection...",
                            cancellable: false
                        },
                        async (progress) => {
                            const result = await setupCreate(message.collectionName);
                            vscode.window.showInformationMessage(`Code Search: ${result.message}`);
                            this._view?.webview.postMessage({ 
                                command: 'showOriginal'
                            });
                        }
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    vscode.window.showInformationMessage(`Code Search Error: ${errorMessage}`);
                    this._view?.webview.postMessage({ command: 'showOriginal' });
                }
            } else if (message.command === "insert") {
                try {
                    await vscode.window.withProgress(
                        {
                            location: vscode.ProgressLocation.Notification,
                            title: "Inserting...",
                            cancellable: false
                        },
                        async (progress) => {
                            const result = await setupInsert(message.repositories);
                            vscode.window.showInformationMessage(`Code Search: ${result.message}`);
                            this._view?.webview.postMessage({ 
                                command: 'showOriginal'
                            });
                        }
                    );
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    vscode.window.showInformationMessage(`Code Search Error: ${errorMessage}`);
                    this._view?.webview.postMessage({ command: 'showOriginal' });
                }
            } else if (message.command === "error") {
                vscode.window.showInformationMessage(`Code Search Error: ${message.text}`);
            }
        },
        undefined,
        []
    );
}


  private getHtmlContent(webview: vscode.Webview): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "main.js")
    );

    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "assets", "vscode.css")
    );

    const nonce = getNonce();

    return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">

                    <link rel="stylesheet" href="https://unpkg.com/modern-css-reset/dist/reset.min.css" />
                    <link href="https://fonts.googleapis.com/css2?family=Muli:wght@300;400;700&display=swap" rel="stylesheet">

                    <link href="${styleResetUri}" rel="stylesheet">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
                <body>
                    <section class="wrapper">
                        <div class="container">
                            <!-- Original View (Visible by Default) -->
                            <div class="content original-view">
                                <p>Enter code query and click search to find similar results:</p>
                                <textarea class="text-input" placeholder="Enter code query" name="codeSnippet" required rows="1"></textarea>
                                <button class="search-button">Search</button>

                                <p>Create a new collection</p>
                                <button class="create-button">New Collection</button>
                                <p>Insert into an existing collection</p>
                                <button class="insert-button">Insert into Collection</button>
                            </div>

                            <!-- Loading View (Hidden by Default) -->
                            <div class="content loading-view" style="display: none;">
                                <p>Searching Database...</p>
                            </div>

                            <!-- Results View (Hidden by Default) -->
                            <div class="content results-view" style="display: none;">
                                <p>Most similar code snippet found:</p>
                                <pre class="result-json"></pre>
                                <button class="back-button">Back to search</button>
                            </div>

                            <!-- Create collection View (Hidden by Default) -->
                            <div class="content create-view" style="display: none;">
                                <p>Create a new collection by entering a new unique name.</p>
                                <textarea class="create-input" placeholder="Enter new collection name" name="codeSnippet" required rows="1"></textarea>
                                <button class="submit-create-button">Create</button>
                                <button class="back-button">Back to search</button>
                            </div>

                            <!-- Insert Collection View (Hidden by Default) -->
                            <div class="content insert-view" style="display: none;">
                                <p>Insert any git repositories and commit hashes you would like to add to the collection.</p>
                                <ul id="repo-list">
                                    <li>
                                        <input class="repo-input" type="text" placeholder="Repository Name">
                                        <input type="text" placeholder="Commit Hash">
                                    </li>
                                </ul>
                                <button class="add-repo-button">Add another repository</button>
                                <button class="submit-insert-button">Insert</button>
                                <button class="back-button">Back to search</button>
                            </div>
                        </div>
                    </section>
                    <script src="${scriptUri}" nonce="${nonce}"></script>
                </body>
            </html>`;
  }
}

function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function setupQuery(inputText: string): Promise<any> {
    // Always timeout the query after 10 seconds
    const timeout = new Promise<void>((_, reject) => {
        setTimeout(() => {
            reject(new Error("Operation timed out"));
        }, 10000);
    });

    try {
        return await Promise.race([query(inputText), timeout]);
    } catch (error) {
        throw error;
    }
}

async function setupCreate(collectionName: string): Promise<any> {
    // Always timeout the query after 10 seconds
    const timeout = new Promise<void>((_, reject) => {
        setTimeout(() => {
            reject(new Error("Operation timed out"));
        }, 10000);
    });

    try {
        return await Promise.race([create(collectionName), timeout]);
    } catch (error) {
        throw error;
    }
}

async function setupInsert(repositories: Array<{ repository: string; commit: string }>): Promise<any> {
    // Always timeout the query after 10 seconds
    const timeout = new Promise<void>((_, reject) => {
        setTimeout(() => {
            reject(new Error("Operation timed out"));
        }, 10000);
    });

    try {
        return await Promise.race([insert(repositories), timeout]);
    } catch (error) {
        throw error;
    }
}