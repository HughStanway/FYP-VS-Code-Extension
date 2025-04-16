import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('codeSearch');

async function getEndpoint() {
    const url = config.get<string>('url');
    if (!url) {
        throw new Error('The "url" setting is required but was not provided.');
    }
 
    const collectionName = config.get<string>('collection');
    if (!collectionName) {
        throw new Error('Collection name not set in extension settings');
    }

    return { url, collectionName };
}

async function makeRequest(endpoint: string, data: Record<string, any>) {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorBody = await response.json() as { message: string };
        throw new Error(errorBody.message);
    }

    return response.json();
}

export async function query(inputText: string): Promise<{ snippet: string }[]> {
    try {
        const { url, collectionName } = await getEndpoint();
        const fullUrl = `${url}/query`;
        const data = { payload: inputText, collectionName };
        
        const result = await makeRequest(fullUrl, data) as { response: { snippet: string }[] };
        return result.response ?? [];
    } catch (error) {
        console.error('Error making query request:', error);
        throw error;
    }
}

export async function create(newCollectionName: string) {
    try {
        const { url } = await getEndpoint();
        return await makeRequest(`${url}/create`, { collectionName: newCollectionName });
    } catch (error) {
        console.error('Error making create request:', error);
        throw error;
    }
}

export async function insert(newRepositories: Array<{ repository: string; commit: string }>) {
    try {
        const { url, collectionName } = await getEndpoint();
        return await makeRequest(`${url}/insert`, { collectionName, repositories: newRepositories });
    } catch (error) {
        console.error('Error making insert request:', error);
        throw error;
    }
}
