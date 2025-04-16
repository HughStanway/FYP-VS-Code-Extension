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
          this.handleAction(message.inputText, "Searching...", setupQuery, 'showResults', true);
        } else if (message.command === "create") {
          this.handleAction(message.collectionName, "Creating collection...", setupCreate, 'showOriginal', false);
        } else if (message.command === "insert") {
          this.handleAction(message.repositories, "Inserting...", setupInsert, 'showOriginal', false);
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
              <div class="content original-view">
                <p>Enter code query and click search to find similar results:</p>
                <textarea class="text-input" placeholder="Enter code query" name="codeSnippet" required rows="1"></textarea>
                <button class="search-button">Search</button>

                <p>Create a new collection</p>
                <button class="create-button">New Collection</button>
                <p>Insert into an existing collection</p>
                <button class="insert-button">Insert into Collection</button>
              </div>

              <div class="content loading-view" style="display: none;">
                <p>Searching Database...</p>
              </div>

              <div class="content results-view" style="display: none;">
                <p>Most similar code snippets:</p>
                <div class="navigation-buttons">
                  <button class="prev-button">Previous</button>
                  <span class="result-counter"></span>
                  <button class="next-button">Next</button>
                </div>
                <pre class="result-json"></pre>
                <button class="back-button">Back to search</button>
              </div>

              <div class="content create-view" style="display: none;">
                <p>Create a new collection by entering a new unique name.</p>
                <textarea class="create-input" placeholder="Enter new collection name" name="codeSnippet" required rows="1"></textarea>
                <button class="submit-create-button">Create</button>
                <button class="back-button">Back to search</button>
              </div>

              <div class="content insert-view" style="display: none;">
                <p>Insert any git repositories and commit hashes you would like to add to the collection.</p>
                <ul id="repo-list">
                  <li>
                    <input class="repo-input" type="text" placeholder="Repository Name">
                    <input class="repo-input" type="text" placeholder="Commit Hash">
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

  private async handleAction<T>(inputData: T, actionTitle: string, actionFunction: (input: T) => Promise<any>, successCommand: string, showLoadingScreen: boolean): Promise<void> {
    if (showLoadingScreen) {
        this._view?.webview.postMessage({ command: 'showLoading' });
    }

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Code search: ${actionTitle}`,
          cancellable: false
        },
        async (progress) => {
          const result = await actionFunction(inputData);
          if (!showLoadingScreen) {
            vscode.window.showInformationMessage(`Code Search: ${result.message}`);
          }
          this._view?.webview.postMessage({
            command: successCommand,
            data: result
          });
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      vscode.window.showInformationMessage(`Code Search Error: ${errorMessage}`);
      this._view?.webview.postMessage({ command: 'showOriginal' });
    }
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
  const timeout = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, 10000);
  });

  try {
    return await Promise.race([query(inputText), timeout]);
  } catch (error) {
    throw error;
  }
}

async function setupCreate(collectionName: string): Promise<any> {
  const timeout = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, 10000);
  });

  try {
    return await Promise.race([create(collectionName), timeout]);
  } catch (error) {
    throw error;
  }
}

async function setupInsert(repositories: Array<{ repository: string; commit: string }>): Promise<any> {
  const timeout = new Promise<void>((_, reject) => {
    setTimeout(() => {
      reject(new Error("Request timed out"));
    }, 10000);
  });

  try {
    return await Promise.race([insert(repositories), timeout]);
  } catch (error) {
    throw error;
  }
}
