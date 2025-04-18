# FYP-VS-Code-Extension

This is the source code for a proof-of-concept VS Code extension designed to connect with the corresponding Code Similarity Search web server. The extension provides a user-friendly interface that allows users to perform code search queries against a vector database directly from within VS Code.

Note: This is the source code for the extension and therefore must be compiled and run using a development build of VS Code.

## 1. Install Dependencies

Before you can run the extension you must install the required dependencies. First, ensure you have Node.js 20+ installed on your local machine. You can check your current version with:

```[bash]
node -v
```

Then, you can install all the required dependencies using:

```[bash]
cd fyp-vs-code-extension && npm install
```

## 2. Running the extension

To run, press `F5` while you have the file `extension.ts` open. This will open a new VS Code window with the extension installed.

### Issue with Extension Not Being Installed

After pressing `F5`, if the extension doesn't appear automatically, it may be due to a mismatch between your installed version of VS Code and the version specified in the extension's requirements. To resolve this, open the `package.json` file and ensure that the `engines.vscode` field is compatible with your local VS Code version. You can find more information about this here: <https://code.visualstudio.com/api/get-started/your-first-extension>

## 3. Usage Instructions

Before usage please configure the extension in your VS Code settings. This can be done by doing the following:

* Open the VS Code settings (CMD + , on MacOS or Ctrl + , on Windows) and navigate to `Extensions -> Code Search`.
* Under `Code Search: URL` enter the full URL of the web server. A demo version of this project can be used by entering the URL `http://hstanway-fyp.ucl.ac.uk` (Please see section 'Setup SSH Tunnel to Connect from Outside Eduroam' if you are using this demo from outside Eduroam).
* Under `Code Search: Collection Name` enter the database collection. (A demo collection has been created under the name `Apache` which contains methods taken from the Apache commons io and lang libraries)

Once this is done you can use the extension by clicking the 'Code Search' tab from the VS Code sidebar. Currently, it supports the following instructions:

* You can make code searches using the search bar at the top of the page. This will query and return the top 5 most similar results from the collection on the server.
* You can create new collections by navigating to the `New Collection` page and entering a new collection name. To use this new collection you will need to reconfigure this in the VS Code settings.
* You can insert Git repositores into the currently configured collection by navigatiing to the `Insert into Collection` page. As these repositories need to be located and configured on the web server please use the demo reposritory: RepoName: `simple-java-methods.git` and CommitHash: `081ce30276353e017f11a9c556427205bfa38124`

## 4. Setup SSH Tunnel to Connect from Outside Eduroam

The curent web server only works within Eduroams firewall. Therefore, you will need to setup an SSH tunnel in order to interact to the server from outside Eduroam. Without this any requests made from the extension will timeout after 10 seconds (This is the default action by the extension).

This can be setup by first adding the following to the `.ssh/config` file on your local machine:

```[bash]
host knuckles
   HostName knuckles.cs.ucl.ac.uk
   User [Your User Name]

host fyp
   HostName hstanway-fyp.cs.ucl.ac.uk
   User [Your User Name]
   ProxyJump knuckles
```

Once you have done this, you can open a tunnel on your machines `localhost` that will forward requests to the web server using the following command:

```[bash]
ssh -L 8888:localhost:80 fyp
```

Now any requests made to `localhost:8888` will be forwarded to `fyp:80` via knuckles. If you are using the demo version you should now make API requests to `http://localhost:8888` instead of `http://hstanway-fyp.cs.ucl.ac.uk`. Finally, once you close the SSH session the tunnel will close and thus the requets will no longer work. 

## 5. Development

Development of the project is managed by esbuild (<https://esbuild.github.io/>). After making any modification to the projects code you must recompile the project before running it again. This is done by running:

```[bash]
cd fyp-vs-code-extension && npm run compile
```
