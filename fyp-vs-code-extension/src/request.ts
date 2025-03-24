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

async function makeQuery(url: string, data: Record<string, any>) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorBody = await response.json() as { error: number, message: string };
        throw new Error(`${errorBody.message}`);
    }

    return response;
}

export async function query(inputText: string): Promise<any> {
    try {
        // Setup request parameters
        const { url, collectionName } = await getEndpoint();
        const fullUrl = url + "/query";
        const data = {
            payload: inputText,
            collectionName: collectionName,
        };
        
        // Make "Query" request
        const response = await makeQuery(fullUrl, data);

        // Extract query respose
        const result = await response.json() as { response: { snippet: string; certainty: number }[] };
        
        // Extract most similar code snippet
        if (Array.isArray(result.response) && result.response.length > 0) {
            const firstItem = result.response[0]; // Get first response (most similar)
            const snippet = firstItem.snippet; // Extract the snippet
            return snippet;
        }
    } catch (error) {
        console.error('Error making POST request:', error);
        throw error;
    }
}

export async function create(newCollectionName: string): Promise<any> {
    try {
        // Setup request parameters
        const { url } = await getEndpoint();
        const fullUrl = url + "/create";
        const data = {
            collectionName: newCollectionName,
        };
        
        // Make "Create" request
        const response = await makeQuery(fullUrl, data);
        
        // Extract query response
        const result = await response.json() as {message: string};
        return result;
        
    } catch (error) {
        console.error('Error making POST request:', error);
        throw error;
    }
}


export async function insert(newRepositories: Array<{ repository: string; commit: string }>): Promise<any> {
    try {
        // Setup request parameters
        const { url, collectionName } = await getEndpoint();
        const fullUrl = url + "/insert";
        const data = {
            collectionName: collectionName,
            repositories: newRepositories,
        };
        
        // Make "Create" request
        const response = await makeQuery(fullUrl, data);
        
        // Extract query response
        const result = await response.json() as {message: string};
        return result;
        
    } catch (error) {
        console.error('Error making POST request:', error);
        throw error;
    }
}