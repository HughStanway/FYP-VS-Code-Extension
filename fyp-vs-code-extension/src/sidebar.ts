import { query } from './request';

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
                            </div>

                            <!-- Loading View (Hidden by Default) -->
                            <div class="content loading-view" style="display: none;">
                                <p>Searching Database...</p>
                            </div>

                            <!-- Results View (Hidden by Default) -->
                            <div class="content results-view" style="display: none;">
                                <p>Most similar code snippets found:</p>
                                <pre class="result-json"></pre>
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