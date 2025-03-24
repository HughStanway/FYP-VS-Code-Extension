const vscode = acquireVsCodeApi();

/* 
    Assign event listeners for extension sidebar content
*/
document.addEventListener("DOMContentLoaded", () => {
    setupAutoExpand();
    setupButtonClickListener();
});

/* 
    Automatically expand the vertical size of the input box so that
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
    Generalized Button Click Handler
*/
function handleButtonClick(command, inputValue, errorMessage) {
    if (inputValue) {
        vscode.postMessage({ command, [command === 'query' ? 'inputText' : 'collectionName']: inputValue });
    } else {
        vscode.postMessage({ command: 'error', text: errorMessage });
    }
}

/* 
    Handle Search Button Click
*/
function handleSearchButtonClick() {
    const inputText = document.querySelector('.text-input').value;
    handleButtonClick('query', inputText, 'Enter a code snippet');
}

/*
    Handle Submit Create Collection Button Click
*/
function handleSubmitCreateButtonClick() {
    const collectionName = document.querySelector('.create-input').value;
    handleButtonClick('create', collectionName, 'Enter a collection name');
}

/*
    Handle Submit Insert Collection Button Click
*/
function handleSubmitInsertButtonClick() {
    const repoList = document.getElementById('repo-list');
    const repoItems = repoList.querySelectorAll('li');
    const repositories = Array.from(repoItems)
        .map(item => {
            const repoInput = item.querySelector('input[placeholder="Repository Name"]');
            const commitInput = item.querySelector('input[placeholder="Commit Hash"]');
            return {
                repository: repoInput ? repoInput.value : '',
                commit: commitInput ? commitInput.value : ''
            };
        })
        .filter(({ repository, commit }) => repository && commit);

    if (repositories.length === 0) {
        vscode.postMessage({ command: 'error', text: 'Insert at least one repository and commit' });
    } else {
        vscode.postMessage({ command: 'insert', repositories });
    }
}

/* 
    Setup Event Listeners for buttons
*/
function setupButtonClickListener() {
    const buttons = [
        { selector: '.search-button', handler: handleSearchButtonClick },
        { selector: '.create-button', handler: () => showCreateView() },
        { selector: '.insert-button', handler: () => { resetRepoList(); showInsertView(); } },
        { selector: '.submit-create-button', handler: handleSubmitCreateButtonClick },
        { selector: '.submit-insert-button', handler: handleSubmitInsertButtonClick },
        { selector: '.add-repo-button', handler: addRepoItem }
    ];

    buttons.forEach(({ selector, handler }) => {
        const button = document.querySelector(selector);
        if (button) {
            button.addEventListener('click', handler);
        }
    });

    function resetRepoList() {
        const repoList = document.getElementById('repo-list');
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
        document.getElementById('repo-list').appendChild(newListItem);
    }
}

/* 
    General event listener for back to home button
*/
document.addEventListener('click', (event) => {
    if (event.target?.classList.contains('back-button')) {
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
function toggleViews(activeView) {
    const views = ['original', 'loading', 'results', 'create', 'insert'];
    views.forEach(view => {
        const viewElement = document.querySelector(`.${view}-view`);
        viewElement.style.display = view === activeView ? 'block' : 'none';
    });
}

function showOriginalView() {
    toggleViews('original');
}

function showLoadingView() {
    toggleViews('loading');
}

function showResultsView(data) {
    toggleViews('results');
    const resultJsonElement = document.querySelector('.result-json');
    if (data) {
        resultJsonElement.textContent = data;
    }
}

function showCreateView() {
    toggleViews('create');
}

function showInsertView() {
    toggleViews('insert');
}
