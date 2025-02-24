import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('codeSearch');

export async function query(inputText: string): Promise<any> {
    try {
        const url = config.get<string>('url');
        if (!url) {
            throw new Error('The "url" setting is required but was not provided.');
        }
        const fullUrl = url + "/query";

        const collectionName = config.get<string>('collection');
        if (!collectionName) {
            throw new Error('Collection name not set in extension settings');
        }

        const data = {
            payload: inputText,
            collectionName: collectionName,
        };

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        // Error handing for result should go here when ready

        // ... Then parse correct response

        return result;
    } catch (error) {
        console.error('Error making POST request:', error);
        throw error;
    }
}
