# FYP-VS-Code-Extension

Prototype Code Similarity Search VS Code extension for my FYP. This is the source code for the extension which enables interaction and code search with the web server back-end using a user-interface directly within VS code.

Note: This is the source code for the extension and therefore must be compiled and run using a development build of VS Code.

## Install Dependencies

Before you can run the extension you must install the required dependencies. First, ensure you have Node.js 20+ installed on your local machine. You can check your current version with:

```[bash]
node -v
```

Then, you can install all the required dependencies using:

```[bash]
npm install
```

## Running the extension

To run, press `F5` while you have the file `extension.ts` open in order to load a new development window with the extension installed and running.

### Issue with Extension Not Being Installed

After pressing `F5`, if the extension is not automatically there then it could be due to an missmatch with the version of VS Code you have installed locally and the requirements of the extension. To fix this, check the `package.json` file and make sure that `engines.vscode` version is compatible with your installed version of VS Code. More information about this can be found here: <https://code.visualstudio.com/api/get-started/your-first-extension>

## Setup SSH Tunnel to Connect from Outside Eduroam

The web server only works within Eduroams firewall. Therefore, you will need to setup an SSH tunnel in order to interact to the server from outside Eduroam. Without this any requests made from the extension will timeout after 10 seconds (This is the default action by the extension).

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

Now any requests made to `localhost:8888` will be forwarded to `fyp:80` via knuckles. Finally, once you close the SSH session the tunnel will close and thus the requets will no longer work.

## Development

Development of the project is managed by esbuild (<https://esbuild.github.io/>). After making any modification to the projects code you must recompile the project before running it again. This is done by running:

```[bash]
npm run compile
```
