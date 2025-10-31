const employees = [
    { id: 1, name: "Alice Johnson", role: "Developer", score: 88 },
    { id: 2, name: "James Smith", role: "Designer", score: 73 },
    { id: 3, name: "Fatou Kamara", role: "Project Manager", score: 91 },
    { id: 4, name: "David Mwangi", role: "QA Engineer", score: 64 }
];

let currentSort = { column: null, ascending: true };
let filteredEmployees = [...employees];
let nextId = 5;

// DOM Elements
const tableContainer = document.getElementById('tableContainer');
const searchInput = document.getElementById('searchInput');
const roleFilter = document.getElementById('roleFilter');
const addEmployeeBtn = document.getElementById('addEmployeeBtn');
const modal = document.getElementById('modal');
const employeeForm = document.getElementById('employeeForm');
const modalTitle = document.getElementById('modalTitle');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    populateRoleFilter();
    renderTable();
    updateSummary();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    roleFilter.addEventListener('change', handleRoleFilter);
    addEmployeeBtn.addEventListener('click', () => openModal());
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    employeeForm.addEventListener('submit', handleFormSubmit);
}

function populateRoleFilter() {
    const roles = [...new Set(employees.map(emp => emp.role))];
    roleFilter.innerHTML = '<option value="">All Roles</option>';
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleFilter.appendChild(option);
    });
}

function renderTable() {
    tableContainer.innerHTML = '';
    
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    
    // Create header
    const headerRow = document.createElement('tr');
    const headers = ['Name', 'Role', 'Score', 'Actions'];
    
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        
        if (header !== 'Actions') {
            th.addEventListener('click', () => sortTable(header.toLowerCase()));
            th.style.cursor = 'pointer';
            
            if (currentSort.column === header.toLowerCase()) {
                const indicator = document.createElement('span');
                indicator.className = 'sort-indicator';
                indicator.textContent = currentSort.ascending ? ' ↑' : ' ↓';
                th.appendChild(indicator);
            }
        }
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    
    // Create body
    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        
        // Apply performance-based styling
        if (employee.score >= 85) {
            row.className = 'high-performance';
        } else if (employee.score >= 70) {
            row.className = 'medium-performance';
        } else {
            row.className = 'low-performance';
        }
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = employee.name;
        row.appendChild(nameCell);
        
        // Role cell
        const roleCell = document.createElement('td');
        roleCell.textContent = employee.role;
        row.appendChild(roleCell);
        
        // Score cell
        const scoreCell = document.createElement('td');
        scoreCell.textContent = employee.score;
        row.appendChild(scoreCell);
        
        // Actions cell
        const actionsCell = document.createElement('td');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'edit-btn';
        editBtn.addEventListener('click', () => openModal(employee));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.addEventListener('click', () => deleteEmployee(employee.id));
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
        row.appendChild(actionsCell);
        
        tbody.appendChild(row);
    });
    
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
}

function sortTable(column) {
    if (currentSort.column === column) {
        currentSort.ascending = !currentSort.ascending;
    } else {
        currentSort.column = column;
        currentSort.ascending = true;
    }
    
    filteredEmployees.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return currentSort.ascending ? -1 : 1;
        if (aVal > bVal) return currentSort.ascending ? 1 : -1;
        return 0;
    });
    
    renderTable();
}

function handleSearch() {
    applyFilters();
}

function handleRoleFilter() {
    applyFilters();
}

function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedRole = roleFilter.value;
    
    filteredEmployees = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm);
        const matchesRole = !selectedRole || employee.role === selectedRole;
        return matchesSearch && matchesRole;
    });
    
    renderTable();
}

function openModal(employee = null) {
    if (employee) {
        modalTitle.textContent = 'Edit Employee';
        document.getElementById('employeeId').value = employee.id;
        document.getElementById('employeeName').value = employee.name;
        document.getElementById('employeeRole').value = employee.role;
        document.getElementById('employeeScore').value = employee.score;
    } else {
        modalTitle.textContent = 'Add Employee';
        employeeForm.reset();
        document.getElementById('employeeId').value = '';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
    employeeForm.reset();
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('employeeId').value;
    const name = document.getElementById('employeeName').value;
    const role = document.getElementById('employeeRole').value;
    const score = parseInt(document.getElementById('employeeScore').value);
    
    // Validation
    if (score < 0 || score > 100) {
        alert('Score must be between 0 and 100');
        return;
    }
    
    if (id) {
        // Edit existing employee
        const index = employees.findIndex(emp => emp.id == id);
        if (index !== -1) {
            employees[index] = { id: parseInt(id), name, role, score };
        }
    } else {
        // Add new employee
        employees.push({ id: nextId++, name, role, score });
    }
    
    populateRoleFilter();
    applyFilters();
    updateSummary();
    closeModal();
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        const index = employees.findIndex(emp => emp.id === id);
        if (index !== -1) {
            employees.splice(index, 1);
            populateRoleFilter();
            applyFilters();
            updateSummary();
        }
    }
}

function updateSummary() {
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML = '';
    
    const title = document.createElement('h3');
    title.textContent = 'Dashboard Summary';
    summaryContainer.appendChild(title);
    
    const statsContainer = document.createElement('div');
    statsContainer.className = 'summary-stats';
    
    // Total employees
    const totalStat = createStatItem(employees.length, 'Total Employees');
    statsContainer.appendChild(totalStat);
    
    // Average score
    const avgScore = employees.length > 0 
        ? (employees.reduce((sum, emp) => sum + emp.score, 0) / employees.length).toFixed(1)
        : 0;
    const avgStat = createStatItem(avgScore, 'Average Score');
    statsContainer.appendChild(avgStat);
    
    // Highest performer
    const topPerformer = employees.length > 0 
        ? employees.reduce((max, emp) => emp.score > max.score ? emp : max)
        : null;
    const topPerformerName = topPerformer ? topPerformer.name : 'N/A';
    const topStat = createStatItem(topPerformerName, 'Top Performer');
    statsContainer.appendChild(topStat);
    
    summaryContainer.appendChild(statsContainer);
}

function createStatItem(value, label) {
    const statItem = document.createElement('div');
    statItem.className = 'stat-item';
    
    const statValue = document.createElement('div');
    statValue.className = 'stat-value';
    statValue.textContent = value;
    
    const statLabel = document.createElement('div');
    statLabel.className = 'stat-label';
    statLabel.textContent = label;
    
    statItem.appendChild(statValue);
    statItem.appendChild(statLabel);
    
    return statItem;
}