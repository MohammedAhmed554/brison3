let students = [];
let cashiers = [];
let users = []; 
let guardians = []; 
let deleteTarget = { type: null, id: null };

function getNextId(array) {
    return array.length > 0 ? Math.max(...array.map(s => s.id)) + 1 : 1;
}

function findItemById(array, id) {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    return array.find(item => item.id === numericId);
}

function prepareGuardianData() {
    const tempGuardians = {};
    
    students.forEach(student => {
        if (!tempGuardians[student.phone]) {
            tempGuardians[student.phone] = {
                name: student.guardian,
                phone: student.phone,
                totalBalance: 0,
                studentCount: 0,
                students: []
            };
        }
        tempGuardians[student.phone].totalBalance += student.balance;
        tempGuardians[student.phone].studentCount += 1;
        tempGuardians[student.phone].students.push(student.fullName);
    });

    guardians = Object.values(tempGuardians).map((g, index) => ({
        ...g,
        id: index + 1,
        totalBalance: g.totalBalance.toFixed(2)
    }));
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'flex';
    const form = modal.querySelector('form');
    if (form) form.reset();
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.style.display = 'none';
}

function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
    
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    const activeLi = document.querySelector(`.sidebar li[data-page="${pageId}"]`);
    if (activeLi) activeLi.classList.add('active');
    // update main page title text from the active sidebar link (use its text without icons)
    const pageTitleEl = document.getElementById('page-title');
    if (pageTitleEl) {
        const link = activeLi ? activeLi.querySelector('a') : null;
        if (link) {
            // get the visible text of the link (trim and remove extra whitespace)
            pageTitleEl.textContent = link.textContent.trim();
        } else {
            pageTitleEl.textContent = '';
        }
    }
    
    if (pageId === 'students-list') {
        renderStudentsTable('students-list-body', students);
    }
    if (pageId === 'guardians-list') {
        prepareGuardianData();
        renderGuardiansTable();
    }
    if (pageId === 'cashiers-list') {
        renderCashiersTable();
    }
    if (pageId === 'users-list') {
        renderUsersTable();
    }
    if (pageId === 'dashboard') {
        updateStats();
    }
}

function updateStats() {
    prepareGuardianData();

    const totalStudentsEl = document.getElementById('total-students');
    const totalGuardiansEl = document.getElementById('total-guardians');
    const totalCashiersEl = document.getElementById('total-cashiers');

    if (totalStudentsEl) totalStudentsEl.textContent = students.length + ' طالب';
    if (totalGuardiansEl) totalGuardiansEl.textContent = guardians.length + ' ولي أمر';
    if (totalCashiersEl) totalCashiersEl.textContent = cashiers.length + ' كاشير';

    // آخر طالبيّن للدashboard
    renderStudentsTable('students-dashboard-body', students.slice(-2).reverse());
}

function renderStudentsTable(tbodyId, data) {
    const tableBody = document.getElementById(tbodyId);
    if (!tableBody) return;

    const isListPage = (tbodyId === 'students-list-body');
    const totalColumns = 8;
    tableBody.innerHTML = '';
    
    if (!data || data.length === 0) {
        const message = isListPage 
            ? 'لا توجد بيانات طلاب حالياً. أضف طالباً جديداً.' 
            : 'لا توجد بيانات حالياً';
        tableBody.innerHTML = `<tr><td colspan="${totalColumns}" style="text-align: center; color: #999;">${message}</td></tr>`;
        return;
    }

    data.forEach(student => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = student.id;
        row.insertCell().textContent = student.fullName;
        row.insertCell().textContent = student.stage;
        row.insertCell().textContent = student.gender;
        row.insertCell().textContent = student.guardian;
        row.insertCell().textContent = student.grade;
        row.insertCell().textContent = student.balance.toFixed(2);
        
        if (isListPage) {
            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.innerHTML = `
                <button class="btn-danger" onclick="deleteItem('student', ${student.id})">
                    <i class="ri-delete-bin-6-line"></i>
                </button>
            `;
        } else {
            row.insertCell().textContent = student.phone;
        }
    });
}

function renderGuardiansTable() {
    const tableBody = document.getElementById('guardians-list-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!guardians || guardians.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #999;">لا توجد بيانات أولياء أمور حالياً.</td></tr>`;
        return;
    }

    guardians.forEach((guardian, index) => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = index + 1;
        row.insertCell().textContent = guardian.name;
        row.insertCell().textContent = guardian.phone;
        row.insertCell().textContent = guardian.totalBalance;
        row.insertCell().textContent = guardian.studentCount;
        
        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');
        actionsCell.innerHTML = `
            <button class="btn-danger" onclick="alert('حذف ولي الأمر ليس إجراءً مباشراً في هذا النظام.')">
                <i class="ri-delete-bin-6-line"></i>
            </button>
            <button class="btn-icon-table" onclick="alert('تفاصيل الطلاب: ${guardian.students.join(', ')}')">
                <iconify-icon icon="solar:eye-outline"></iconify-icon>
            </button>
        `;
    });
}

function renderCashiersTable() {
    const tableBody = document.getElementById('cashiers-list-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!cashiers || cashiers.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #999;">لا توجد بيانات كاشير حالياً. أضف كاشيراً جديداً.</td></tr>`;
        return;
    }

    cashiers.forEach(cashier => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = cashier.id;
        row.insertCell().textContent = cashier.fullName;
        row.insertCell().textContent = cashier.phone;
        row.insertCell().textContent = cashier.stage;
        row.insertCell().textContent = cashier.gender;
        
        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');
        actionsCell.innerHTML = `
            <button class="btn-danger" onclick="deleteItem('cashier', ${cashier.id})">
                <i class="ri-delete-bin-6-line"></i>
            </button>
        `;
    });
}

function renderUsersTable() {
    const tableBody = document.getElementById('users-list-body');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    if (!users || users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #999;">لا توجد بيانات مستخدمين حالياً. أضف مستخدماً جديداً.</td></tr>`;
        return;
    }

    users.forEach(user => {
        const row = tableBody.insertRow();
        row.insertCell().textContent = user.id;
        row.insertCell().textContent = user.name;
        row.insertCell().textContent = user.role;
        row.insertCell().textContent = user.phone;
        
        const actionsCell = row.insertCell();
        actionsCell.classList.add('actions-cell');
        actionsCell.innerHTML = `
            <button class="btn-danger" onclick="deleteItem('user', ${user.id})">
                <i class="ri-delete-bin-6-line"></i>
            </button>
        `;
    });
}

function addStudent(event) {
    event.preventDefault();
    const newStudent = {
        id: getNextId(students),
        fullName:
            document.getElementById('student-first-name').value + ' ' +
            document.getElementById('student-father-name').value + ' ' +
            document.getElementById('student-last-name').value,
        stage: document.getElementById('student-stage').value,
        gender: document.getElementById('student-gender').value,
        grade: document.getElementById('student-grade').value,
        guardian: document.getElementById('guardian-name').value,
        phone: document.getElementById('guardian-phone').value,
        balance: 0.00
    };
    
    students.push(newStudent);
    closeModal('addStudentModal');
    openModal('successModal');
    showPage('students-list');
}

function addCashier(event) {
    event.preventDefault();
    const newCashier = {
        id: getNextId(cashiers),
        fullName:
            document.getElementById('cashier-first-name').value + ' ' +
            document.getElementById('cashier-father-name').value + ' ' +
            document.getElementById('cashier-last-name').value,
        phone: document.getElementById('cashier-phone').value,
        stage: document.getElementById('cashier-stage').value,
        gender: document.getElementById('cashier-gender').value,
    };
    
    cashiers.push(newCashier);
    closeModal('addCashierModal');
    openModal('successModal');
    showPage('cashiers-list');
}

function addUser(event) {
    event.preventDefault();
    const newUser = {
        id: getNextId(users),
        name: document.getElementById('user-name').value,
        role: document.getElementById('user-role').value,
        phone: document.getElementById('user-phone').value,
        dateCreated: new Date().toISOString().slice(0, 10)
    };
    
    users.push(newUser);
    closeModal('addUserModal');
    openModal('successModal');
    showPage('users-list');
}

function deleteItem(type, id) {
    deleteTarget.type = type;
    deleteTarget.id = id;
    openModal('deleteConfirmModal');
}

function confirmDelete() {
    const { type, id } = deleteTarget;
    let array = null;
    
    if (type === 'student') array = students;
    else if (type === 'cashier') array = cashiers;
    else if (type === 'user') array = users;
    
    if (array) {
        const index = array.findIndex(item => item.id === id);
        if (index !== -1) {
            array.splice(index, 1);
        }
    }

    closeModal('deleteConfirmModal');
    openModal('successModal');

    if (type === 'student') showPage('students-list');
    else if (type === 'cashier') showPage('cashiers-list'); 
    else if (type === 'user') showPage('users-list');
    
    deleteTarget = { type: null, id: null };
}

document.addEventListener('DOMContentLoaded', () => {
    // مباشرة افتح الرئيسية وحدث الإحصائيات
    showPage('dashboard');

    // إضافة حدث للزر الجانبي
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('hidden');
            main.classList.toggle('sidebar-hidden');
        });
    }

    // إغلاق القائمة عند النقر خارجها على الجوال
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                sidebar.classList.add('hidden');
                main.classList.remove('sidebar-hidden');
            }
        }
    });

    // إغلاق القائمة عند اختيار صفحة على الجوال
    const sidebarLinks = sidebar.querySelectorAll('nav ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('hidden');
                main.classList.remove('sidebar-hidden');
            }
        });
    });
});
