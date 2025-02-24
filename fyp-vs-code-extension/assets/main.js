/*
    Use VSCode API
*/
const vscode = acquireVsCodeApi();

/*
    Assign event listeners for extension sidebar content
*/
document.addEventListener("DOMContentLoaded", setupAutoExpand);
document.addEventListener("DOMContentLoaded", setupButtonClickListener);

/* 
    Automatically extand the vertical size of the input box so that
    it always fits the entire text content without needing to scroll
*/
function autoExpand(event) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

/* 
    Setup Auto Expand function
*/
function setupAutoExpand() {
    const textarea = document.querySelector('.text-input');
    if (textarea) {
        textarea.addEventListener('input', autoExpand);
        textarea.addEventListener('keydown', autoExpand);
        autoExpand({ target: textarea });
    }
}

/* 
    Handle Search Button Click
*/
function handleButtonClick() {
    const inputText = document.querySelector('.text-input').value;
    if (inputText) {
        vscode.postMessage({ command: 'query', inputText: inputText });
    } else {
        vscode.postMessage({ command: 'error', text: 'Please enter a code snippet' });
    }
}


/* 
    Setup Search Button function
*/
function setupButtonClickListener() {
    const searchButton = document.querySelector('.search-button');
    const backButton = document.querySelector('.back-button');

    if (searchButton) {
        searchButton.addEventListener('click', handleButtonClick);
    }

    if (backButton) {
        backButton.addEventListener('click', () => {
            showOriginalView();
        });
    }
}

/* 
    Listener to manage view updates
*/
window.addEventListener('message', (event) => {
    const message = event.data;
    switch (message.command) {
        case 'showLoading':
            showLoadingView();
            break;
        case 'showResults':
            showResultsView(message.data);
            break;
        case 'showOriginal':
            showOriginalView();
            break;
    }
});

/* 
    Functions to manage switching between views
*/
function showLoadingView() {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'block';
    document.querySelector('.results-view').style.display = 'none';
}

function showResultsView(data) {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'block';

    const resultJsonElement = document.querySelector('.result-json');
    if (data) {
        resultJsonElement.textContent = data;
    }
}

function showOriginalView() {
    document.querySelector('.original-view').style.display = 'block';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'none';
}
