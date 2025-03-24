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
        vscode.postMessage({ command: 'error', text: 'Enter a code snippet' });
    }
}

/*
    Handle Submit Create Collection Button Click
*/
function handleSubmitCreateButtonClick() {
    const collectionName = document.querySelector('.create-input').value;
    if (collectionName) {
        vscode.postMessage({ command: 'create', collectionName: collectionName });
    } else {
        vscode.postMessage({ command: 'error', text: 'Enter a collection name' });
    }
}

/*
    Handle Submit Insert Collection Button Click
*/
function handleSubmitInsertButtonClick() {
    const repoList = document.getElementById('repo-list');
    const repoItems = repoList.querySelectorAll('li');
    const repositories = [];
    
    repoItems.forEach(item => {
        const repoInput = item.querySelector('input[placeholder="Repository Name"]');
        const commitInput = item.querySelector('input[placeholder="Commit Hash"]');
        const repoName = repoInput ? repoInput.value : '';
        const commitHash = commitInput ? commitInput.value : '';

        // Only add to the list if both values are non-empty
        if (repoName && commitHash) {
            repositories.push({ repository: repoName, commit: commitHash });
        }
    });

    if (repositories.length === 0) {
        vscode.postMessage({ command: 'error', text: 'Insert at least one repository and commit' });
    } else {
        vscode.postMessage({ command: 'insert', repositories: repositories });
    }
}


/* 
    Setup Search Button function
*/
function setupButtonClickListener() {
    const searchButton = document.querySelector('.search-button');
    const createButton = document.querySelector('.create-button');
    const insertButton = document.querySelector('.insert-button');
    const submitCreateButton = document.querySelector('.submit-create-button');
    const submitInsertButton = document.querySelector('.submit-insert-button');
    const addRepoButton = document.querySelector('.add-repo-button');
    const repoList = document.getElementById('repo-list');

    if (searchButton) {
        searchButton.addEventListener('click', handleButtonClick);
    }

    if (createButton) {
        createButton.addEventListener('click', () => {
            showCreateView();
        });
    }
    
    if (insertButton) {
        insertButton.addEventListener('click', () => {
            resetRepoList();
            showInsertView();
        });
    }

    if (submitCreateButton) {
        submitCreateButton.addEventListener('click', handleSubmitCreateButtonClick);
    }

    if (submitInsertButton) {
        submitInsertButton.addEventListener('click', handleSubmitInsertButtonClick);
    }

    if (addRepoButton && repoList) {
        addRepoButton.addEventListener('click', addRepoItem);
    }

    function resetRepoList() {
        if (repoList) {
            repoList.innerHTML = '';
            addRepoItem();
        }
    }

    function addRepoItem() {
        const newListItem = document.createElement('li');
        newListItem.innerHTML = `
            <input type="text" placeholder="Repository Name">
            <input type="text" placeholder="Commit Hash">
        `;
        repoList.appendChild(newListItem);
    }
}

/* 
    General event listener for back to home button
*/
document.addEventListener('click', (event) => {
    if (event.target && event.target.classList.contains('back-button')) {
      showOriginalView();
    }
  });

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

function showOriginalView() {
    document.querySelector('.original-view').style.display = 'block';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'none';
    document.querySelector('.create-view').style.display = 'none';
    document.querySelector('.insert-view').style.display = 'none';
}

function showLoadingView() {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'block';
    document.querySelector('.results-view').style.display = 'none';
    document.querySelector('.create-view').style.display = 'none';
    document.querySelector('.insert-view').style.display = 'none';
}

function showResultsView(data) {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'block';
    document.querySelector('.create-view').style.display = 'none';
    document.querySelector('.insert-view').style.display = 'none';

    const resultJsonElement = document.querySelector('.result-json');
    if (data) {
        resultJsonElement.textContent = data;
    }
}

function showCreateView() {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'none';
    document.querySelector('.create-view').style.display = 'block';
    document.querySelector('.insert-view').style.display = 'none';
}

function showInsertView() {
    document.querySelector('.original-view').style.display = 'none';
    document.querySelector('.loading-view').style.display = 'none';
    document.querySelector('.results-view').style.display = 'none';
    document.querySelector('.create-view').style.display = 'none';
    document.querySelector('.insert-view').style.display = 'block';
}
