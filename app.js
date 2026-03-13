let allIssuesData = [];

// 1. LOGIN LOGIC
function handleLogin() {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    if (user === 'admin' && pass === 'admin123') {
        document.getElementById('login-section').classList.add('hidden');
        document.getElementById('dashboard-section').classList.remove('hidden');
        loadAllIssues();
    } else {
        alert("Incorrect credentials! Use admin / admin123");
    }
}

// 2. FETCH ALL DATA
async function loadAllIssues() {
    toggleSpinner(true);
    try {
        const response = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const json = await response.json();

        // CLIENT REQUIREMENT: Data is usually inside json.data
        allIssuesData = json.data;
        console.log("All Issues Loaded:", allIssuesData);

        displayIssues(allIssuesData);
    } catch (error) {
        console.error("API Error:", error);
    } finally {
        toggleSpinner(false);
    }
}

// 3. DISPLAY ISSUES (4-Column Grid)
function displayIssues(issues) {
    const grid = document.getElementById('issues-grid');
    const counter = document.getElementById('status-counter');
    grid.innerHTML = "";

    if (!issues || issues.length === 0) {
        counter.innerText = "No Issues Found";
        grid.innerHTML = `<div class="col-span-full text-center py-10 text-gray-400">No issues matching your criteria.</div>`;
        return;
    }

    counter.innerText = `Showing ${issues.length} Issues`;

    issues.forEach(issue => {
        // CHALLENGE: Green border for Open, Purple for Closed
        const borderStyle = issue.status.toLowerCase() === 'open' ? 'border-t-green-500' : 'border-t-purple-500';

        const card = document.createElement('div');
        card.className = `card bg-white shadow-md border-t-4 ${borderStyle} hover:shadow-xl transition-all cursor-pointer`;
        card.onclick = () => loadSingleIssue(issue.id);

        card.innerHTML = `
            <div class="card-body p-5">
                <div class="flex justify-between items-start mb-2">
                    <span class="badge badge-sm uppercase font-bold ${issue.status === 'open' ? 'badge-success text-white' : 'badge-secondary'}">${issue.status}</span>
                </div>
                <h2 class="card-title text-base line-clamp-1">${issue.title}</h2>
                <p class="text-xs text-gray-500 line-clamp-2 mt-1 mb-4">${issue.description}</p>
              <div class="flex flex-wrap gap-2 mb-4">
                        ${issue.labels.map(label => ` <span class="px-2 py-1 bg-yellow-200 text-yellow-800 rounded text-[10px] font-semibold">${label} </span>`).join("")}
                         </div>
                                                 



                <div class="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                        <div class="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white capitalize">
                            ${issue.author[0]}
                        </div>
                        <span class="text-xs font-semibold">${issue.author}</span>
                    </div>
                    <span class="text-[10px] uppercase font-bold text-gray-400">${issue.priority}</span>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// 4. FILTER LOGIC
function filterIssues(status, btnElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('btn-active', 'border-primary'));
    btnElement.classList.add('btn-active', 'border-primary');

    if (status === 'all') {
        displayIssues(allIssuesData);
    } else {
        const filtered = allIssuesData.filter(item => item.status.toLowerCase() === status.toLowerCase());
        displayIssues(filtered);
    }
}

// 5. SEARCH LOGIC
async function handleSearch() {
    const searchText = document.getElementById('search-input').value;
    if (!searchText) return loadAllIssues();

    toggleSpinner(true);
    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${searchText}`);
        const json = await response.json();
        displayIssues(json.data); // Fixed: target json.data
    } catch (error) {
        console.error("Search Error:", error);
    } finally {
        toggleSpinner(false);
    }
}

// 6. SINGLE ISSUE (MODAL)
async function loadSingleIssue(id) {
    try {
        const response = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const json = await response.json();
        const data = json.data; // Fixed: target json.data

        const modalContent = document.getElementById('modal-content');
        modalContent.innerHTML = `
            <div class="flex items-center gap-2 mb-4">
                <span class="badge ${data.status === 'open' ? 'badge-success' : 'badge-secondary'} text-white capitalize">${data.status}</span>
                <h3 class="font-bold text-2xl">${data.title}</h3>
            </div>
            <p class="text-gray-600 mb-6">${data.description}</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg">
                <p><strong>Author:</strong> ${data.author}</p>
                <p><strong>Label:</strong> ${data.labels}</p>
                <p><strong>Priority:</strong> ${data.priority}</p>
                <p><strong>Date:</strong> ${new Date(data.createdAt).toLocaleDateString()}</p>
            </div>
        `;
        document.getElementById('issue_modal').showModal();
    } catch (error) {
        console.error("Modal Error:", error);
    }
}

function toggleSpinner(show) {
    const spinner = document.getElementById('loading-spinner');
    if (show) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
}