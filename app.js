// Archivo script.js - Versión Definitiva Unificada

// --- 0. GESTOR DE DATOS COMPARTIDO (CORE) ---
// Estas funciones permiten que Admin y Cliente vean los mismos datos y que se guarden al recargar.
const DB_KEY_CITAS = 'gestorpro_citas';
const CURRENT_USER_NAME = "Juan Pérez"; 

// Helper para obtener fecha en formato YYYY-MM-DD local
const getISODate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Obtener citas del almacenamiento o devolver datos de prueba iniciales
function getCitas() {
    const stored = localStorage.getItem(DB_KEY_CITAS);
    if (stored) return JSON.parse(stored);
    
    // Datos iniciales de prueba (para que no esté vacío al empezar)
    const todayStr = getISODate(new Date());
    return [
        { id: 101, date: todayStr, time: "10:00", client: "Cliente Prueba", service: "Corte de Cabello", price: 30, status: "confirmada" },
        { id: 102, date: todayStr, time: "14:00", client: "María López", service: "Tinte", price: 50, status: "pendiente" }
    ];
}

// Guardar citas en almacenamiento
function saveCitas(citas) {
    localStorage.setItem(DB_KEY_CITAS, JSON.stringify(citas));
}


// --- 1. INTERFAZ COMÚN (Sidebar y Menú) ---
const mobileMenuButton = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');

if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}
if (sidebar && sidebarToggle) {
    sidebarToggle.addEventListener('click', () => sidebar.classList.toggle('-translate-x-full'));
}


// --- 2. LOGIN ---
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        if (!email || !password) { alert("Completa los campos"); return; }
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.innerText = "Verificando...";
        submitBtn.disabled = true;

        setTimeout(() => {
            // Lógica simple de roles
            if (email === 'admin@gestor.com' && password === 'admin123') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'app.html';
            }
            submitBtn.innerText = "Iniciar Sesión";
            submitBtn.disabled = false;
        }, 800);
    });
}
const loginBtnLink = document.getElementById('login-btn');
if (loginBtnLink) loginBtnLink.addEventListener('click', (e) => { e.preventDefault(); window.location.href = 'login.html'; });


// --- 3. CRUD DE PRODUCTOS (ADMIN) ---
const productsTableBody = document.getElementById('products-table-body');
if (productsTableBody) {
    let products = [
        { id: 1, name: 'Shampoo Profesional', price: 25.50, stock: 12, image: 'https://via.placeholder.com/40' },
        { id: 2, name: 'Cera Mate', price: 15.00, stock: 5, image: 'https://via.placeholder.com/40' }
    ];

    function renderProducts() {
        productsTableBody.innerHTML = '';
        products.forEach(product => {
            const row = document.createElement('tr');
            row.className = "hover:bg-gray-50 border-b border-gray-200";
            let stockBadge = product.stock > 0 
                ? `<span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight"><span aria-hidden="true" class="absolute inset-0 bg-green-200 opacity-50 rounded-full"></span><span class="relative">En Stock</span></span>`
                : `<span class="relative inline-block px-3 py-1 font-semibold text-red-900 leading-tight"><span aria-hidden="true" class="absolute inset-0 bg-red-200 opacity-50 rounded-full"></span><span class="relative">Agotado</span></span>`;

            row.innerHTML = `
                <td class="px-5 py-5 text-sm"><div class="flex items-center"><div class="flex-shrink-0 w-10 h-10"><img class="w-full h-full rounded-full object-cover" src="${product.image}" alt="${product.name}" /></div><div class="ml-3"><p class="text-gray-900 whitespace-no-wrap font-medium">${product.name}</p></div></div></td>
                <td class="px-5 py-5 text-sm"><p class="text-gray-900 whitespace-no-wrap">$${product.price.toFixed(2)}</p></td>
                <td class="px-5 py-5 text-sm"><p class="text-gray-900 whitespace-no-wrap">${product.stock}</p></td>
                <td class="px-5 py-5 text-sm">${stockBadge}</td>
                <td class="px-5 py-5 text-sm text-center">
                    <button onclick="editProduct(${product.id})" class="text-blue-600 hover:text-blue-900 mr-3 font-medium">Editar</button>
                    <button onclick="deleteProduct(${product.id})" class="text-red-600 hover:text-red-900 font-medium">Borrar</button>
                </td>`;
            productsTableBody.appendChild(row);
        });
    }

    // Modal de Productos
    const modal = document.getElementById('product-modal');
    const btnAdd = document.getElementById('btn-add-product');
    const btnCancel = document.getElementById('btn-cancel-product');
    const btnSave = document.getElementById('btn-save-product');
    const inputId = document.getElementById('product-id');
    const inputName = document.getElementById('product-name');
    const inputPrice = document.getElementById('product-price');
    const inputStock = document.getElementById('product-stock');
    const inputImage = document.getElementById('product-image');

    if(btnAdd) btnAdd.addEventListener('click', () => { inputId.value=''; inputName.value=''; inputPrice.value=''; inputStock.value=''; inputImage.value=''; document.getElementById('modal-title').innerText='Nuevo Producto'; modal.classList.remove('hidden'); });
    if(btnCancel) btnCancel.addEventListener('click', () => modal.classList.add('hidden'));
    
    if(btnSave) btnSave.addEventListener('click', () => { 
        if(!inputName.value || !inputPrice.value || !inputStock.value) { alert("Completa los campos obligatorios"); return; }
        const id = inputId.value; 
        const productData = { id: id ? parseInt(id) : Date.now(), name: inputName.value, price: parseFloat(inputPrice.value), stock: parseInt(inputStock.value), image: inputImage.value || 'https://via.placeholder.com/40' };
        if (id) { const index = products.findIndex(p => p.id == id); if (index !== -1) products[index] = productData; } 
        else { products.push(productData); }
        renderProducts(); modal.classList.add('hidden'); 
    });

    window.editProduct = (id) => { const p = products.find(p => p.id === id); if(p) { inputId.value=p.id; inputName.value=p.name; inputPrice.value=p.price; inputStock.value=p.stock; inputImage.value=p.image; document.getElementById('modal-title').innerText='Editar Producto'; modal.classList.remove('hidden'); }};
    window.deleteProduct = (id) => { if(confirm('Borrar?')) { products = products.filter(p=>p.id!==id); renderProducts(); }};
    renderProducts();
}


// --- 4. AGENDA DE CITAS (ADMIN - CORREGIDO) ---
const agendaGrid = document.getElementById('agenda-grid');

if (agendaGrid) {
    const hours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
    
    // Estado
    let currentDate = new Date();
    // IMPORTANTE: Cargar citas reales del storage
    let appointments = getCitas();

    // Elementos DOM Agenda
    const labelDay = document.getElementById('current-day-label');
    const labelDate = document.getElementById('current-date-label');
    const inputDatePicker = document.getElementById('date-picker-input');
    const btnPrevDay = document.getElementById('btn-prev-day');
    const btnNextDay = document.getElementById('btn-next-day');

    // Elementos DOM Modal
    const citaModal = document.getElementById('cita-modal');
    const btnSaveCita = document.getElementById('btn-save-cita');
    const btnCancelCita = document.getElementById('btn-cancel-cita');
    const inputHoraCita = document.getElementById('cita-hora');
    const displayHoraCita = document.getElementById('display-hora');
    const inputClienteCita = document.getElementById('cita-cliente');
    const inputServicioCita = document.getElementById('cita-servicio');

    // Manejo de Fecha
    function updateDateDisplay() {
        const today = new Date();
        const isToday = currentDate.toDateString() === today.toDateString();
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        let dayName = currentDate.toLocaleDateString('es-ES', { weekday: 'long' });
        dayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
        
        if(labelDay) labelDay.innerText = isToday ? 'Hoy' : dayName;
        if(labelDate) labelDate.innerText = currentDate.toLocaleDateString('es-ES', options);
        if(inputDatePicker) inputDatePicker.value = getISODate(currentDate);
    }

    function changeDay(offset) {
        currentDate.setDate(currentDate.getDate() + offset);
        updateDateDisplay();
        renderAgenda(); 
    }

    if(btnPrevDay) btnPrevDay.addEventListener('click', () => changeDay(-1));
    if(btnNextDay) btnNextDay.addEventListener('click', () => changeDay(1));
    if(inputDatePicker) inputDatePicker.addEventListener('change', (e) => { 
        if(e.target.value) { 
            const [y, m, d] = e.target.value.split('-'); 
            currentDate = new Date(y, m - 1, d); 
            updateDateDisplay(); renderAgenda(); 
        }
    });

    // Renderizar Grilla
    function renderAgenda() {
        if(!agendaGrid) return;
        agendaGrid.innerHTML = ''; 
        
        const selectedDateStr = getISODate(currentDate);
        // Filtrar citas de LA FECHA SELECCIONADA
        const currentAppts = appointments.filter(a => a.date === selectedDateStr);

        hours.forEach(hour => {
            const appt = currentAppts.find(a => a.time === hour);
            const slotDiv = document.createElement('div');
            
            if (appt) {
                // Hora Ocupada
                const borderClass = appt.status === 'confirmada' ? 'border-green-500' : 'border-yellow-500';
                slotDiv.className = `flex items-center bg-white p-4 rounded-lg shadow-sm border-l-4 ${borderClass} transition hover:shadow-md`;
                slotDiv.innerHTML = `
                    <div class="w-20 font-bold text-gray-700 text-lg">${hour}</div>
                    <div class="flex-1 pl-4 border-l border-gray-100">
                        <p class="font-bold text-gray-800">${appt.client}</p>
                        <p class="text-sm text-gray-500">${appt.service}</p>
                    </div>
                    <div>
                         <button onclick="cancelAppointment(${appt.id})" class="text-red-500 hover:text-red-700 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded">Cancelar</button>
                    </div>`;
            } else {
                // Hora Disponible
                slotDiv.className = `flex items-center bg-white p-4 rounded-lg shadow-sm border-l-4 border-gray-200 opacity-75 hover:opacity-100 hover:border-acento transition cursor-pointer group`;
                slotDiv.innerHTML = `
                    <div class="w-20 font-bold text-gray-400 text-lg group-hover:text-primario">${hour}</div>
                    <div class="flex-1 pl-4 border-l border-gray-100">
                        <span class="text-gray-400 font-medium group-hover:text-gray-600">Disponible</span>
                    </div>
                    <button onclick="openAppointmentModal('${hour}')" class="bg-gray-100 text-gray-600 hover:bg-acento hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                        + Agendar
                    </button>`;
            }
            agendaGrid.appendChild(slotDiv);
        });
    }

    // Funciones del Modal
    window.openAppointmentModal = function(time) {
        inputHoraCita.value = time;
        displayHoraCita.value = time;
        inputClienteCita.value = '';
        inputServicioCita.selectedIndex = 0;
        citaModal.classList.remove('hidden');
    };

    if(btnCancelCita) btnCancelCita.addEventListener('click', () => citaModal.classList.add('hidden'));

    if(btnSaveCita) btnSaveCita.addEventListener('click', () => {
        const time = inputHoraCita.value;
        const client = inputClienteCita.value;
        const service = inputServicioCita.value;

        if (!client) { alert("Por favor ingresa el nombre del cliente"); return; }

        // CORRECCIÓN: Ahora incluimos la FECHA (date) al guardar
        const newAppt = {
            id: Date.now(),
            date: getISODate(currentDate), // Usamos la fecha seleccionada en el calendario
            time: time,
            client: client,
            service: service,
            status: 'confirmada'
        };

        appointments.push(newAppt);
        saveCitas(appointments); // GUARDAMOS EN STORAGE
        renderAgenda();
        citaModal.classList.add('hidden'); // CERRAMOS MODAL
    });

    window.cancelAppointment = function(id) {
        if (confirm("¿Estás seguro de cancelar esta cita?")) {
            appointments = appointments.filter(a => a.id !== id);
            saveCitas(appointments); // ACTUALIZAMOS STORAGE
            renderAgenda();
        }
    };

    updateDateDisplay();
    renderAgenda();
}


// --- 5. DASHBOARD ADMIN (Próximas Citas) ---
const dashboardTable = document.querySelector('tbody'); 
// Verificación para ejecutar solo en Dashboard Admin (si hay tabla y no es productos/agenda/cliente)
if (dashboardTable && !document.getElementById('products-table-body') && !document.getElementById('agenda-grid') && !document.getElementById('client-appointments-body')) {
    
    const allAppointments = getCitas();
    const todayStr = getISODate(new Date());

    // Ordenar por fecha y filtrar futuras
    const sortedAppts = allAppointments
        .filter(a => a.date >= todayStr)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
        .slice(0, 5);

    dashboardTable.innerHTML = ''; 
    
    if (sortedAppts.length === 0) {
        dashboardTable.innerHTML = `<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No hay citas próximas.</td></tr>`;
    } else {
        sortedAppts.forEach(appt => {
            const tr = document.createElement('tr');
            tr.className = "hover:bg-gray-50 transition";
            const statusBg = appt.status === 'confirmada' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
            
            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-bold text-gray-700">${appt.time} <span class="text-xs font-normal text-gray-500">(${appt.date})</span></td>
                <td class="px-6 py-4 text-sm text-gray-600">${appt.client}</td>
                <td class="px-6 py-4 text-sm text-gray-600">${appt.service}</td>
                <td class="px-6 py-4"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBg} capitalize">${appt.status}</span></td>
                <td class="px-6 py-4 text-sm"><a href="agenda.html" class="text-blue-600 hover:text-blue-900 mr-2">Ver</a></td>
            `;
            dashboardTable.appendChild(tr);
        });
    }
}


// --- 6. CLIENTE (APP.HTML) ---
const sectionReservar = document.getElementById('section-reservar');

if (sectionReservar) {
    const services = [
        { id: 1, name: "Corte de Cabello", price: 30, duration: "45 min", icon: "✂️" },
        { id: 2, name: "Barba y Afeitado", price: 15, duration: "30 min", icon: "🪒" },
        { id: 3, name: "Tinte Completo", price: 50, duration: "90 min", icon: "🎨" },
        { id: 4, name: "Tratamiento Facial", price: 40, duration: "60 min", icon: "💆" },
        { id: 5, name: "Paquete Completo", price: 70, duration: "120 min", icon: "✨" }
    ];

    let selectedService = null;
    let selectedDate = null;
    let selectedTime = null;

    // Grid Servicios
    const servicesGrid = document.getElementById('services-grid');
    if (servicesGrid) {
        servicesGrid.innerHTML = services.map(s => `
            <div onclick="selectService(${s.id})" class="service-card bg-white p-6 rounded-lg shadow-sm border-2 border-transparent hover:border-acento cursor-pointer transition flex flex-col items-center text-center group">
                <div class="text-4xl mb-4 group-hover:scale-110 transition">${s.icon}</div>
                <h4 class="font-bold text-gray-700 mb-1">${s.name}</h4>
                <p class="text-sm text-gray-500 mb-3">${s.duration}</p>
                <span class="bg-fondo text-primario font-bold px-3 py-1 rounded-full">$${s.price}</span>
            </div>
        `).join('');
    }

    window.selectService = function(id) {
        selectedService = services.find(s => s.id === id);
        // Visual feedback
        document.querySelectorAll('.service-card').forEach(c => c.classList.remove('border-acento', 'bg-gray-50'));
        // (En una app real seleccionaríamos el elemento específico, aquí asumimos reset)

        document.getElementById('step-datetime').classList.remove('hidden');
        
        // Setup Datepicker
        const picker = document.getElementById('client-date-picker');
        picker.value = getISODate(new Date()); // Hoy por defecto
        picker.dispatchEvent(new Event('change')); // Trigger render slots
        
        document.getElementById('step-datetime').scrollIntoView({ behavior: 'smooth' });
    };

    window.resetBooking = function() {
        document.getElementById('step-datetime').classList.add('hidden');
        selectedService = null; selectedTime = null; selectedDate = null;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Slots Cliente
    const clientDatePicker = document.getElementById('client-date-picker');
    const slotsGrid = document.getElementById('client-slots-grid');
    const clientHours = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    if(clientDatePicker) clientDatePicker.addEventListener('change', (e) => {
        const dateStr = e.target.value;
        if(!dateStr) return;
        
        const allAppointments = getCitas();
        const dayAppointments = allAppointments.filter(a => a.date === dateStr);

        slotsGrid.innerHTML = clientHours.map(hour => {
            const isTaken = dayAppointments.some(a => a.time === hour && a.status !== 'cancelada');
            if (isTaken) {
                return `<button disabled class="bg-gray-100 text-gray-400 border border-gray-200 py-2 rounded cursor-not-allowed line-through">${hour}</button>`;
            } else {
                return `<button onclick="initConfirmBooking('${dateStr}', '${hour}')" class="bg-white text-primario border border-primario py-2 rounded hover:bg-primario hover:text-white transition font-medium">${hour}</button>`;
            }
        }).join('');
    });

    // Confirmación Cliente
    const confirmModal = document.getElementById('confirm-modal');
    window.initConfirmBooking = function(date, time) {
        if(!selectedService) return;
        selectedDate = date; selectedTime = time;
        
        document.getElementById('confirm-service').innerText = selectedService.name;
        document.getElementById('confirm-date').innerText = date;
        document.getElementById('confirm-time').innerText = time;
        document.getElementById('confirm-price').innerText = `$${selectedService.price}`;
        confirmModal.classList.remove('hidden');
    }
    
    window.closeConfirmModal = function() { confirmModal.classList.add('hidden'); }

    const btnConfirmBooking = document.getElementById('btn-confirm-booking');
    if(btnConfirmBooking) {
        // Clonar para limpiar listeners previos si hubieran
        const newBtn = btnConfirmBooking.cloneNode(true);
        btnConfirmBooking.parentNode.replaceChild(newBtn, btnConfirmBooking);
        
        newBtn.addEventListener('click', () => {
            if(!selectedService || !selectedDate || !selectedTime) { alert("Faltan datos"); return; }
            
            const allAppointments = getCitas();
            allAppointments.push({
                id: Date.now(),
                date: selectedDate,
                time: selectedTime,
                client: CURRENT_USER_NAME,
                service: selectedService.name,
                price: selectedService.price,
                status: 'confirmada'
            });
            saveCitas(allAppointments);
            
            alert("¡Reserva Confirmada!");
            closeConfirmModal();
            resetBooking();
            showClientSection('mis-citas');
        });
    }

    // Tabs Cliente
    window.showClientSection = function(sectionId) {
        document.getElementById('section-reservar').classList.add('hidden');
        document.getElementById('section-mis-citas').classList.add('hidden');
        
        // Reset botones
        document.getElementById('nav-reservar').className = "w-full block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100 text-gray-600 hover:text-primario text-left";
        document.getElementById('nav-mis-citas').className = "w-full block py-2.5 px-4 rounded transition duration-200 hover:bg-gray-100 text-gray-600 hover:text-primario text-left";

        if (sectionId === 'reservar') {
            document.getElementById('section-reservar').classList.remove('hidden');
            document.getElementById('page-title').innerText = "Nueva Reserva";
            document.getElementById('nav-reservar').classList.add('bg-primario', 'text-white');
            document.getElementById('nav-reservar').classList.remove('text-gray-600', 'hover:bg-gray-100');
        } else {
            document.getElementById('section-mis-citas').classList.remove('hidden');
            document.getElementById('page-title').innerText = "Mis Citas";
            document.getElementById('nav-mis-citas').classList.add('bg-primario', 'text-white');
            document.getElementById('nav-mis-citas').classList.remove('text-gray-600', 'hover:bg-gray-100');
            renderClientAppointments();
        }
    }

    function renderClientAppointments() {
        const tbody = document.getElementById('client-appointments-body');
        const allAppointments = getCitas();
        const myAppts = allAppointments.filter(a => a.client === CURRENT_USER_NAME)
                                       .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

        if (myAppts.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" class="px-5 py-5 text-center text-gray-500">No tienes citas.</td></tr>`;
            return;
        }

        tbody.innerHTML = myAppts.map(appt => `
            <tr>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div class="font-bold text-gray-900">${appt.date}</div>
                    <div class="text-gray-500">${appt.time}</div>
                </td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">${appt.service}</td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${appt.status==='confirmada'?'bg-green-100 text-green-800':'bg-yellow-100 text-yellow-800'} capitalize">${appt.status}</span></td>
                <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm"><button onclick="cancelClientAppt(${appt.id})" class="text-red-600 hover:text-red-900">Cancelar</button></td>
            </tr>
        `).join('');
    }

    window.cancelClientAppt = function(id) {
        if(confirm("¿Cancelar cita?")) {
            const allAppointments = getCitas().filter(a => a.id !== id);
            saveCitas(allAppointments);
            renderClientAppointments();
        }
    }
}