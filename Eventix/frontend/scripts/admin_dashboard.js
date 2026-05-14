// ==================== CONFIGURACIÓN Y ESTADO GLOBAL ====================

const adminState = {
    currentSection: 'dashboard',
    sidebarCollapsed: false,
    currentPage: 1,
    itemsPerPage: 10,
    filters: {
        status: 'all',
        service: 'all',
        date: null
    },
    dashboardPeriod: 'week',
    charts: {},
    updateTimeout: null,
    listenersAttached: false,
    chartsInitialized: false,
    // ✨ Sistema de notificaciones
    notifications: [],
    lastUserCount: 0,
    lastReservationCount: 0,
    notificationCheckInterval: null,
    // ✨ NUEVO: Guardar IDs procesados para evitar duplicados
    processedUserIds: new Set(),
    processedReservationIds: new Set()
};

// ==================== INICIALIZACIÓN ====================

function showLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.style.display = 'flex';
        loader.classList.remove('hiding');
    }
}

function hideLoader() {
    const loader = document.getElementById('pageLoader');
    if (loader) {
        loader.classList.add('hiding');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.adminInitialized) {
        console.log('⚠️ Dashboard ya inicializado');
        return;
    }
    
    window.adminInitialized = true;
    initializeAdmin();
});

function initializeAdmin() {
    console.log('🚀 Iniciando Panel Administrativo...');
    
    try {
        showLoader();
        
        if (!checkAdminAuth()) {
            hideLoader();
            return;
        }
        
        // ✨ Inicializar catálogo de destinos si no existe
        initializeDestinationsCatalog();
        
        // ✨ Inicializar sistema de notificaciones PRIMERO
        initializeNotificationSystem();
        
        setupEventListeners();
        
        // Cargar datos esenciales
        setTimeout(() => {
            loadDashboardData();
            
            // Cargar secciones después
            setTimeout(() => {
                if (adminState.currentSection === 'reservations') loadReservations();
                if (adminState.currentSection === 'destinations') loadDestinations();
                if (adminState.currentSection === 'users') loadUsers();
            }, 300);
            
            // Gráficos al final
            setTimeout(() => {
                if (!adminState.chartsInitialized) {
                    initializeCharts();
                    adminState.chartsInitialized = true;
                }
            }, 800);
            
            hideLoader();
        }, 100);
        
    } catch (error) {
        console.error('❌ Error en inicialización:', error);
        hideLoader();
    }
}

// ==================== GESTIÓN DE DESTINOS EN LOCALSTORAGE ====================

function initializeDestinationsCatalog() {
    // Verificar si ya existe el catálogo en localStorage
    const existingCatalog = localStorage.getItem('destinations-catalog');
    
    if (!existingCatalog) {
        console.log('🏞️ Inicializando catálogo de destinos por primera vez...');
        
        // Catálogo inicial
        const initialCatalog = [
            { 
                id: 'dest_001',
                name: 'Xhimanut', 
                location: 'Gigante', 
                price: 35000, 
                image: '../assets/img/parque_xhimnaut_123.jpg',
                type: 'parque',
                description: 'Parque acuático con toboganes y piscinas naturales',
                createdAt: new Date().toISOString()
            },
            { 
                id: 'dest_002',
                name: 'Los Pinos', 
                location: 'Hobo', 
                price: 25000, 
                image: '../assets/img/los_pinos.jpg',
                type: 'parque',
                description: 'Parque natural con senderos ecológicos',
                createdAt: new Date().toISOString()
            },
            { 
                id: 'dest_003',
                name: 'La Mano del Gigante', 
                location: 'El Rodeo', 
                price: 21000, 
                image: '../assets/img/la_mano_gigante_fondo.jpg',
                type: 'mirador',
                description: 'Mirador icónico con vista panorámica del desierto',
                createdAt: new Date().toISOString()
            },
            { 
                id: 'dest_004',
                name: 'La Loma de la Cruz', 
                location: 'Gigante', 
                price: 0, 
                image: '../assets/img/loma_cruz_gigante.jpg',
                type: 'mirador',
                description: 'Mirador religioso con vistas espectaculares',
                createdAt: new Date().toISOString()
            },
            { 
                id: 'dest_005',
                name: 'Los Pinos - Glamping', 
                location: 'Hobo', 
                price: 180000, 
                image: '../assets/img/los_pinos.jpg',
                type: 'glamping',
                description: 'Experiencia de camping de lujo en la naturaleza',
                createdAt: new Date().toISOString()
            },
            { 
                id: 'dest_006',
                name: 'La Perla Finca Hotel', 
                location: 'Bajo Corozal', 
                price: 280000, 
                image: '../assets/img/perla_finca_gigante.jpg',
                type: 'hospedaje',
                description: 'Hotel boutique con servicios premium',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('destinations-catalog', JSON.stringify(initialCatalog));
        console.log('✅ Catálogo de destinos inicializado con ' + initialCatalog.length + ' destinos');
    } else {
        console.log('✅ Catálogo de destinos ya existe en localStorage');
    }
}

function getDestinations() {
    const catalog = localStorage.getItem('destinations-catalog');
    return catalog ? JSON.parse(catalog) : [];
}

function saveDestinations(destinations) {
    localStorage.setItem('destinations-catalog', JSON.stringify(destinations));
    console.log('💾 Catálogo de destinos guardado');
}

// ==================== SISTEMA DE NOTIFICACIONES MEJORADO ==================== 

function initializeNotificationSystem() {
    console.log('🔔 Inicializando sistema de notificaciones...');
    
    // Cargar notificaciones guardadas
    loadNotifications();
    
    // ✨ Establecer contadores iniciales y guardar IDs existentes
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    adminState.lastUserCount = users.length;
    adminState.lastReservationCount = reservations.length;
    
    // ✨ Guardar IDs existentes para no crear notificaciones duplicadas
    users.forEach(user => {
        const userId = user.email || user.id;
        if (userId) adminState.processedUserIds.add(userId);
    });
    
    reservations.forEach(reservation => {
        const resId = reservation.bookingCode || reservation.id;
        if (resId) adminState.processedReservationIds.add(resId);
    });
    
    console.log(`📊 Estado inicial: ${adminState.lastUserCount} usuarios, ${adminState.lastReservationCount} reservas`);
    console.log(`📝 IDs procesados: ${adminState.processedUserIds.size} usuarios, ${adminState.processedReservationIds.size} reservas`);
    
    // Actualizar badge inicial
    updateNotificationBadge();
    
    // ✨ MEJORADO: Escuchar cambios en localStorage en TIEMPO REAL
    window.addEventListener('storage', function(e) {
        console.log('🔥 ¡Cambio detectado en localStorage!', e.key);
        
        if (e.key === 'users' || e.key === 'reservations') {
            console.log('🎯 Cambio relevante detectado, verificando inmediatamente...');
            setTimeout(() => checkForNewData(), 100);
        }
    });
    
    // ✨ NUEVO: También detectar cambios en la MISMA pestaña con CustomEvent
    window.addEventListener('localStorageUpdated', function(e) {
        console.log('🔥 ¡LocalStorage actualizado en esta pestaña!', e.detail);
        setTimeout(() => checkForNewData(), 100);
    });
    
    // ✨ Verificar cada 3 segundos como respaldo
    if (adminState.notificationCheckInterval) {
        clearInterval(adminState.notificationCheckInterval);
    }
    
    adminState.notificationCheckInterval = setInterval(() => {
        checkForNewData();
    }, 3000);
    
    console.log('✅ Sistema de notificaciones activo:');
    console.log('   - ⚡ Detección en tiempo real (storage event)');
    console.log('   - ⚡ Detección en misma pestaña (custom event)');
    console.log('   - 🔄 Verificación cada 3 segundos (respaldo)');
}

function loadNotifications() {
    const saved = localStorage.getItem('admin-notifications');
    if (saved) {
        try {
            adminState.notifications = JSON.parse(saved);
            console.log(`📥 Notificaciones cargadas: ${adminState.notifications.length}`);
        } catch (error) {
            console.error('❌ Error cargando notificaciones:', error);
            adminState.notifications = [];
        }
    } else {
        adminState.notifications = [];
        console.log('📭 No hay notificaciones guardadas');
    }
}

function saveNotifications() {
    try {
        localStorage.setItem('admin-notifications', JSON.stringify(adminState.notifications));
        console.log(`💾 Notificaciones guardadas: ${adminState.notifications.length}`);
    } catch (error) {
        console.error('❌ Error guardando notificaciones:', error);
    }
}

function checkForNewData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    const currentUserCount = users.length;
    const currentReservationCount = reservations.length;
    
    let changesDetected = false;
    
    // ✨ DETECTAR NUEVOS USUARIOS
    if (currentUserCount > adminState.lastUserCount) {
        console.log('🆕 Nuevos usuarios detectados!');
        changesDetected = true;
        
        // Encontrar usuarios nuevos que no hemos procesado
        users.forEach(user => {
            const userId = user.email || user.id;
            if (userId && !adminState.processedUserIds.has(userId)) {
                console.log('👤 Creando notificación para nuevo usuario:', user.email);
                
                createNotification({
                    type: 'user',
                    title: '¡Nuevo Usuario Registrado!',
                    message: `${user.fullName || user.email} se ha registrado en el sistema`,
                    user: user,
                    timestamp: new Date().toISOString()
                });
                
                // Marcar como procesado
                adminState.processedUserIds.add(userId);
            }
        });
        
        adminState.lastUserCount = currentUserCount;
        
        // Recargar sección de usuarios si está activa
        if (adminState.currentSection === 'users') {
            loadUsers();
        }
    }
    
    // ✨ DETECTAR NUEVAS RESERVAS
    if (currentReservationCount > adminState.lastReservationCount) {
        console.log('🆕 Nuevas reservas detectadas!');
        changesDetected = true;
        
        // Encontrar reservas nuevas que no hemos procesado
        reservations.forEach(reservation => {
            const resId = reservation.bookingCode || reservation.id;
            if (resId && !adminState.processedReservationIds.has(resId)) {
                console.log('📅 Creando notificación para nueva reserva:', reservation.bookingCode);
                
                createNotification({
                    type: 'reservation',
                    title: '¡Nueva Reserva Recibida!',
                    message: `${reservation.personalInfo.fullName} - ${reservation.destination.name}`,
                    reservation: reservation,
                    timestamp: new Date().toISOString()
                });
                
                // Marcar como procesada
                adminState.processedReservationIds.add(resId);
            }
        });
        
        adminState.lastReservationCount = currentReservationCount;
        
        // Recargar dashboard y reservas
        loadDashboardData();
        if (adminState.currentSection === 'reservations') {
            loadReservations();
        }
    }
    
    if (changesDetected) {
        console.log('✅ Cambios procesados y notificaciones actualizadas');
    }
}

function createNotification(data) {
    const notification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        ...data,
        read: false
    };
    
    console.log('📬 Creando notificación:', notification);
    
    adminState.notifications.unshift(notification);
    
    // Limitar a 50 notificaciones
    if (adminState.notifications.length > 50) {
        adminState.notifications = adminState.notifications.slice(0, 50);
    }
    
    saveNotifications();
    updateNotificationBadge();
    showNotificationToast(notification);
    playNotificationSound();
}

function showNotificationToast(notification) {
    console.log('🍞 Mostrando toast para:', notification.title);
    
    // Remover toast anterior si existe
    const existingToast = document.querySelector('.notification-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    
    const iconClass = notification.type === 'user' ? 'fa-user-plus' : 'fa-calendar-check';
    const iconBg = notification.type === 'user' ? 
        'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' : 
        'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    
    toast.innerHTML = `
        <div class="toast-icon" style="background: ${iconBg};">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${notification.title}</div>
            <div class="toast-message">${notification.message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('fade-out');
            setTimeout(() => {
                if (toast.parentElement) toast.remove();
            }, 300);
        }
    }, 5000);
}

function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.log('🔇 No se pudo reproducir sonido:', error);
    }
}

function updateNotificationBadge() {
    const unreadCount = adminState.notifications.filter(n => !n.read).length;
    const badge = document.querySelector('.notification-badge');
    
    console.log(`🔔 Actualizando badge: ${unreadCount} notificaciones sin leer`);
    
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

function toggleNotificationsPanel() {
    let panel = document.getElementById('notificationsPanel');
    
    if (!panel) {
        panel = createNotificationsPanel();
        document.body.appendChild(panel);
    }
    
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        console.log('📂 Abriendo panel de notificaciones');
        renderNotifications();
    } else {
        console.log('📁 Cerrando panel de notificaciones');
    }
}

function createNotificationsPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationsPanel';
    panel.className = 'notifications-panel';
    panel.innerHTML = `
        <div class="notifications-header">
            <h3><i class="fas fa-bell"></i> Notificaciones</h3>
            <div class="notifications-actions">
                <button class="btn-mark-read" onclick="markAllAsRead()" title="Marcar todas como leídas">
                    <i class="fas fa-check-double"></i>
                </button>
                <button class="btn-close-panel" onclick="toggleNotificationsPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
        <div class="notifications-body" id="notificationsBody">
            <!-- Se llenará dinámicamente -->
        </div>
    `;
    
    return panel;
}

function renderNotifications() {
    const body = document.getElementById('notificationsBody');
    if (!body) return;
    
    console.log(`📋 Renderizando ${adminState.notifications.length} notificaciones`);
    
    if (adminState.notifications.length === 0) {
        body.innerHTML = `
            <div class="notifications-empty">
                <i class="fas fa-bell-slash"></i>
                <p>No hay notificaciones</p>
            </div>
        `;
        return;
    }
    
    body.innerHTML = adminState.notifications.map(notif => {
        const iconClass = notif.type === 'user' ? 'fa-user-plus' : 'fa-calendar-check';
        const iconType = notif.type === 'user' ? 'user' : 'reservation';
        const time = formatTimeAgo(notif.timestamp);
        
        return `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" onclick="handleNotificationClick('${notif.id}')">
                <div class="notification-icon ${iconType}">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notif.title}</div>
                    <div class="notification-message">${notif.message}</div>
                    <div class="notification-time">${time}</div>
                </div>
                ${!notif.read ? '<div class="notification-dot"></div>' : ''}
            </div>
        `;
    }).join('');
}

function handleNotificationClick(notificationId) {
    const notification = adminState.notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    console.log('🖱️ Click en notificación:', notificationId);
    
    // Marcar como leída
    notification.read = true;
    saveNotifications();
    updateNotificationBadge();
    
    // Navegar a la sección correspondiente
    if (notification.type === 'user') {
        navigateToSection('users');
        toggleNotificationsPanel();
        
        // Resaltar el usuario nuevo
        setTimeout(() => {
            if (notification.user && notification.user.email) {
                highlightNewUser(notification.user.email);
            }
        }, 500);
        
    } else if (notification.type === 'reservation') {
        navigateToSection('reservations');
        toggleNotificationsPanel();
        
        // Resaltar la reserva nueva
        setTimeout(() => {
            if (notification.reservation && notification.reservation.bookingCode) {
                highlightNewReservation(notification.reservation.bookingCode);
            }
        }, 500);
    }
}

function highlightNewUser(email) {
    console.log('🎯 Buscando usuario para resaltar:', email);
    const rows = document.querySelectorAll('#usersTableBody tr');
    rows.forEach(row => {
        if (row.textContent.includes(email)) {
            row.classList.add('highlight-animation');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('✨ Usuario resaltado');
        }
    });
}

function highlightNewReservation(bookingCode) {
    console.log('🎯 Buscando reserva para resaltar:', bookingCode);
    const rows = document.querySelectorAll('#reservationsTableBody tr');
    rows.forEach(row => {
        if (row.textContent.includes(bookingCode)) {
            row.classList.add('highlight-animation');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log('✨ Reserva resaltada');
        }
    });
}

function markAllAsRead() {
    console.log('✅ Marcando todas las notificaciones como leídas');
    adminState.notifications.forEach(n => n.read = true);
    saveNotifications();
    updateNotificationBadge();
    renderNotifications();
}

// ✨ NUEVO: Función helper para notificar cambios en localStorage desde otras páginas
window.notifyLocalStorageChange = function(key) {
    console.log('📡 Emitiendo evento de cambio en localStorage:', key);
    window.dispatchEvent(new CustomEvent('localStorageUpdated', { detail: key }));
};

// ✨ NUEVO: Función para forzar verificación manual (útil para testing)
window.forceCheckNotifications = function() {
    console.log('🔍 Verificación manual de notificaciones...');
    checkForNewData();
};

// ✨ NUEVO: Función para limpiar notificaciones (útil para testing)
window.clearAllNotifications = function() {
    if (confirm('¿Eliminar todas las notificaciones?')) {
        adminState.notifications = [];
        adminState.processedUserIds.clear();
        adminState.processedReservationIds.clear();
        
        // Recalcular IDs procesados actuales
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        
        users.forEach(user => {
            const userId = user.email || user.id;
            if (userId) adminState.processedUserIds.add(userId);
        });
        
        reservations.forEach(reservation => {
            const resId = reservation.bookingCode || reservation.id;
            if (resId) adminState.processedReservationIds.add(resId);
        });
        
        adminState.lastUserCount = users.length;
        adminState.lastReservationCount = reservations.length;
        
        saveNotifications();
        updateNotificationBadge();
        renderNotifications();
        console.log('🗑️ Notificaciones eliminadas y sistema reiniciado');
    }
};

// ==================== AUTENTICACIÓN ====================

function checkAdminAuth() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('techstore-user-data') || 'null');
        
        if (!currentUser) {
            if (!window.location.pathname.includes('login.html') && !sessionStorage.getItem('redirecting')) {
                sessionStorage.setItem('redirecting', 'true');
                alert('⚠️ Acceso denegado. Solo administradores.');
                window.location.replace('login.html');
            }
            return false;
        }
        
        const userRole = currentUser.role ? currentUser.role.toLowerCase() : '';
        
        if (userRole !== 'admin') {
            if (!window.location.pathname.includes('login.html') && !sessionStorage.getItem('redirecting')) {
                sessionStorage.setItem('redirecting', 'true');
                alert('⚠️ Acceso denegado. Solo administradores.');
                window.location.replace('login.html');
            }
            return false;
        }
        
        sessionStorage.removeItem('redirecting');
        updateAdminInfo(currentUser);
        return true;
    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        return false;
    }
}

function updateAdminInfo(user) {
    const fullName = user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Administrador';
    const initials = getInitials(fullName);
    
    document.querySelectorAll('.admin-avatar, .user-avatar').forEach(el => {
        el.textContent = initials;
    });
    document.querySelectorAll('.admin-name, .user-name').forEach(el => {
        el.textContent = fullName;
    });
}

function getInitials(name) {
    if (!name) return 'AD';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().substring(0, 2);
}

// ==================== EVENT LISTENERS ====================

function setupEventListeners() {
    if (adminState.listenersAttached) return;
    adminState.listenersAttached = true;
    
    console.log('🎧 Configurando event listeners...');
    
    // Sidebar
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    
    if (sidebarToggle) sidebarToggle.onclick = toggleSidebar;
    if (mobileMenuToggle) mobileMenuToggle.onclick = toggleMobileSidebar;
    
    // Navegación
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            if (section) navigateToSection(section);
        };
    });
    
    // ✨ Botón de notificaciones
    const notificationBtn = document.getElementById('notificationBtn');
    if (notificationBtn) {
        notificationBtn.onclick = (e) => {
            e.stopPropagation();
            toggleNotificationsPanel();
        };
        console.log('✅ Botón de notificaciones configurado');
    } else {
        console.warn('⚠️ No se encontró el botón de notificaciones');
    }
    
    // Cerrar panel de notificaciones al hacer clic fuera
    document.addEventListener('click', (e) => {
        const panel = document.getElementById('notificationsPanel');
        const notifBtn = document.getElementById('notificationBtn');
        
        if (panel && panel.classList.contains('active')) {
            if (!panel.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
                panel.classList.remove('active');
            }
        }
    });
    
    // User menu
    const userMenuToggle = document.getElementById('userMenuToggle');
    const userDropdown = document.getElementById('userDropdown');
    if (userMenuToggle && userDropdown) {
        userMenuToggle.onclick = (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        };
        
        document.onclick = (e) => {
            if (!userMenuToggle.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        };
    }
    
    // Logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.onclick = handleLogout;
    
    // Filtros
    const filterStatus = document.getElementById('filterStatus');
    const filterService = document.getElementById('filterService');
    const filterDate = document.getElementById('filterDate');
    
    if (filterStatus) filterStatus.onchange = function() {
        adminState.filters.status = this.value;
        loadReservations();
    };
    if (filterService) filterService.onchange = function() {
        adminState.filters.service = this.value;
        loadReservations();
    };
    if (filterDate) filterDate.onchange = function() {
        adminState.filters.date = this.value;
        loadReservations();
    };
    
    // Exportar
    const btnExport = document.getElementById('btnExportReservations');
    if (btnExport) btnExport.onclick = exportReservations;
    
    // Destinos
    const btnAddDest = document.getElementById('btnAddDestination');
    if (btnAddDest) btnAddDest.onclick = () => openDestinationModal();
    
    const destForm = document.getElementById('destinationForm');
    if (destForm) destForm.onsubmit = handleDestinationSubmit;
    
    // Selector período
    const periodSelector = document.getElementById('dashboardPeriodSelector');
    if (periodSelector) {
        periodSelector.onchange = debounce(function() {
            if (adminState.dashboardPeriod !== this.value) {
                adminState.dashboardPeriod = this.value;
                updateDashboardWithPeriod();
            }
        }, 500);
    }
    
    console.log('✅ Event listeners configurados');
}

function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ==================== NAVEGACIÓN ====================

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
    adminState.sidebarCollapsed = !adminState.sidebarCollapsed;
}

function toggleMobileSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

function navigateToSection(sectionName) {
    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    
    // Mostrar sección actual
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) targetSection.classList.add('active');
    
    // Actualizar nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Actualizar título
    const titles = {
        'dashboard': 'Dashboard',
        'reservations': 'Gestión de Reservas',
        'destinations': 'Gestión de Destinos',
        'users': 'Gestión de Usuarios',
        'analytics': 'Análisis y Estadísticas',
        'reports': 'Reportes',
        'settings': 'Configuración'
    };
    const pageTitle = document.querySelector('.page-title');
    if (pageTitle) pageTitle.textContent = titles[sectionName] || 'Panel Administrativo';
    
    adminState.currentSection = sectionName;
    
    // Cargar datos de la sección
    if (sectionName === 'reservations') loadReservations();
    if (sectionName === 'destinations') loadDestinations();
    if (sectionName === 'users') loadUsers();
    
    // Cerrar sidebar en móvil
    if (window.innerWidth <= 968) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

function handleLogout() {
    if (confirm('¿Cerrar sesión?')) {
        // Limpiar intervalo de notificaciones
        if (adminState.notificationCheckInterval) {
            clearInterval(adminState.notificationCheckInterval);
            console.log('🛑 Sistema de notificaciones detenido');
        }
        
        if (window.authAPI) {
            window.authAPI.logout();
        } else {
            localStorage.removeItem('techstore-auth-token');
            localStorage.removeItem('techstore-user-data');
            localStorage.removeItem('techstore-login-time');
        }
        window.location.href = 'login.html';
    }
}

// ==================== DASHBOARD ====================

function getDateRangeForPeriod(period) {
    const now = new Date();
    const startDate = new Date();
    
    switch(period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'biweekly':
            startDate.setDate(now.getDate() - 14);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 7);
    }
    
    return { startDate, endDate: now };
}

function filterByDateRange(reservations, startDate, endDate) {
    return reservations.filter(r => {
        const date = new Date(r.timestamp);
        return date >= startDate && date <= endDate;
    });
}

function updateDashboardWithPeriod() {
    if (adminState.updateTimeout) clearTimeout(adminState.updateTimeout);
    
    adminState.updateTimeout = setTimeout(() => {
        loadDashboardData();
        if (adminState.chartsInitialized) {
            updateCharts();
        }
    }, 300);
}

function loadDashboardData() {
    try {
        const allReservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        const { startDate, endDate } = getDateRangeForPeriod(adminState.dashboardPeriod);
        const reservations = filterByDateRange(allReservations, startDate, endDate);
        
        // Stats
        const total = reservations.length;
        const pending = reservations.filter(r => r.status === 'pending').length;
        const revenue = reservations
            .filter(r => r.status !== 'cancelled')
            .reduce((sum, r) => sum + (r.pricing?.total || 0), 0);
        
        const totalEl = document.getElementById('totalReservations');
        const pendingEl = document.getElementById('pendingReservations');
        const revenueEl = document.getElementById('totalRevenue');
        const usersEl = document.getElementById('totalUsers');
        
        if (totalEl) totalEl.textContent = total;
        if (pendingEl) pendingEl.textContent = pending;
        if (revenueEl) revenueEl.textContent = formatCurrency(revenue);
        if (usersEl) usersEl.textContent = users.length;
        
        // Badge
        const badge = document.getElementById('pendingReservationsBadge');
        if (badge) {
            badge.textContent = pending;
            badge.style.display = pending > 0 ? 'flex' : 'none';
        }
        
        loadRecentActivity(reservations);
        
    } catch (error) {
        console.error('❌ Error en dashboard:', error);
    }
}

function loadRecentActivity(reservations) {
    const container = document.getElementById('recentActivity');
    if (!container) return;
    
    const recent = reservations
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 3);
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#6b7280;padding:20px;">Sin actividad reciente</p>';
        return;
    }
    
    container.innerHTML = recent.map(r => {
        const iconBg = r.status === 'pending' ? '#f59e0b' : 
                       r.status === 'confirmed' ? '#10b981' : '#ef4444';
        
        return `
            <div class="activity-item">
                <div class="activity-icon" style="background:${iconBg};">
                    <i class="fas fa-calendar-check"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Reserva de ${r.personalInfo.fullName}</div>
                    <div class="activity-time">${formatTimeAgo(r.timestamp)} • ${r.destination.name}</div>
                </div>
            </div>
        `;
    }).join('');
}

// ==================== RESERVAS ====================

function loadReservations() {
    let reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    if (adminState.filters.status !== 'all') {
        reservations = reservations.filter(r => r.status === adminState.filters.status);
    }
    
    if (adminState.filters.service !== 'all') {
        reservations = reservations.filter(r => r.serviceType === adminState.filters.service);
    }
    
    if (adminState.filters.date) {
        reservations = reservations.filter(r => r.checkIn === adminState.filters.date);
    }
    
    displayReservations(reservations);
}

function displayReservations(reservations) {
    const tbody = document.getElementById('reservationsTableBody');
    if (!tbody) return;
    
    if (reservations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align:center;padding:40px;color:#6b7280;">
                    <i class="fas fa-inbox" style="font-size:48px;margin-bottom:16px;display:block;"></i>
                    No hay reservas
                </td>
            </tr>
        `;
        return;
    }
    
    reservations.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    tbody.innerHTML = reservations.map(r => {
        const statusClass = `status-${r.status || 'pending'}`;
        const statusText = {
            'pending': 'Pendiente',
            'confirmed': 'Confirmada',
            'cancelled': 'Cancelada'
        }[r.status] || 'Pendiente';
        
        return `
            <tr>
                <td><strong>${r.bookingCode}</strong></td>
                <td>${r.personalInfo.fullName}</td>
                <td>${r.destination.name}</td>
                <td>${getServiceLabel(r.serviceType)}</td>
                <td>${formatDate(r.checkIn)}</td>
                <td>${formatDate(r.checkOut)}</td>
                <td>${r.numPeople}</td>
                <td><strong>${formatCurrency(r.pricing.total)} COP</strong></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="action-btn btn-view" onclick="viewReservationDetails('${r.bookingCode}')" title="Ver">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${r.status === 'pending' ? `
                        <button class="action-btn btn-edit" onclick="confirmReservation('${r.bookingCode}')" title="Confirmar">
                            <i class="fas fa-check"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="cancelReservation('${r.bookingCode}')" title="Cancelar">
                            <i class="fas fa-times"></i>
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function viewReservationDetails(bookingCode) {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const r = reservations.find(res => res.bookingCode === bookingCode);
    
    if (!r) return;
    
    const modal = document.getElementById('reservationDetailsModal');
    const content = document.getElementById('reservationDetailsContent');
    
    if (!modal || !content) return;
    
    content.innerHTML = `
        <div style="display:grid;gap:20px;">
            <div style="background:linear-gradient(135deg,#F4C400,#FFE347);padding:20px;border-radius:12px;text-align:center;">
                <div style="font-size:14px;color:#195C33;font-weight:600;margin-bottom:8px;">Código</div>
                <div style="font-size:28px;font-weight:800;color:#195C33;">${r.bookingCode}</div>
            </div>
            
            <div>
                <h3 style="font-size:16px;font-weight:700;color:#195C33;margin-bottom:12px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">
                    <i class="fas fa-user"></i> Cliente
                </h3>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
                    <div><strong style="color:#6b7280;font-size:12px;">Nombre:</strong><div style="font-size:14px;font-weight:600;">${r.personalInfo.fullName}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Email:</strong><div style="font-size:14px;font-weight:600;">${r.personalInfo.email}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Teléfono:</strong><div style="font-size:14px;font-weight:600;">${r.personalInfo.phone}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Documento:</strong><div style="font-size:14px;font-weight:600;">${r.personalInfo.documentType} - ${r.personalInfo.documentNumber}</div></div>
                </div>
            </div>
            
            <div>
                <h3 style="font-size:16px;font-weight:700;color:#195C33;margin-bottom:12px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">
                    <i class="fas fa-calendar-alt"></i> Detalles
                </h3>
                <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
                    <div><strong style="color:#6b7280;font-size:12px;">Destino:</strong><div style="font-size:14px;font-weight:600;">${r.destination.name}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Servicio:</strong><div style="font-size:14px;font-weight:600;">${getServiceLabel(r.serviceType)}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Check-in:</strong><div style="font-size:14px;font-weight:600;">${formatDate(r.checkIn)}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Check-out:</strong><div style="font-size:14px;font-weight:600;">${formatDate(r.checkOut)}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Noches:</strong><div style="font-size:14px;font-weight:600;">${r.nights}</div></div>
                    <div><strong style="color:#6b7280;font-size:12px;">Personas:</strong><div style="font-size:14px;font-weight:600;">${r.numPeople}</div></div>
                </div>
            </div>
            
            <div>
                <h3 style="font-size:16px;font-weight:700;color:#195C33;margin-bottom:12px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">
                    <i class="fas fa-dollar-sign"></i> Pago
                </h3>
                <div style="background:#f9fafb;padding:16px;border-radius:8px;">
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Subtotal:</span><strong>${formatCurrency(r.pricing.subtotal)} COP</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Tarifa:</span><strong>${formatCurrency(r.pricing.serviceFee)} COP</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e5e7eb;">
                        <span>Impuestos:</span><strong>${formatCurrency(r.pricing.tax)} COP</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:12px 0;font-size:18px;font-weight:800;color:#195C33;">
                        <span>TOTAL:</span><span>${formatCurrency(r.pricing.total)} COP</span>
                    </div>
                </div>
            </div>
            
            ${r.status === 'pending' ? `
            <div style="display:flex;gap:12px;">
                <button class="btn-primary" onclick="confirmReservation('${r.bookingCode}');closeModal('reservationDetailsModal');" style="flex:1;">
                    <i class="fas fa-check"></i> Confirmar
                </button>
                <button class="btn-secondary" onclick="cancelReservation('${r.bookingCode}');closeModal('reservationDetailsModal');" style="flex:1;background:#fee2e2;color:#991b1b;">
                    <i class="fas fa-times"></i> Cancelar
                </button>
            </div>
            ` : ''}
        </div>
    `;
    
    modal.classList.add('active');
}

function confirmReservation(bookingCode) {
    if (!confirm('¿Confirmar reserva?')) return;
    
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const r = reservations.find(res => res.bookingCode === bookingCode);
    
    if (r) {
        r.status = 'confirmed';
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
        loadDashboardData();
        alert('✅ Reserva confirmada');
    }
}

function cancelReservation(bookingCode) {
    if (!confirm('¿Cancelar reserva?')) return;
    
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const r = reservations.find(res => res.bookingCode === bookingCode);
    
    if (r) {
        r.status = 'cancelled';
        localStorage.setItem('reservations', JSON.stringify(reservations));
        loadReservations();
        loadDashboardData();
        alert('✅ Reserva cancelada');
    }
}

function exportReservations() {
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    if (reservations.length === 0) {
        alert('No hay reservas para exportar');
        return;
    }
    
    const headers = ['Código','Cliente','Email','Destino','Check-in','Check-out','Total','Estado'];
    const rows = reservations.map(r => [
        r.bookingCode,
        r.personalInfo.fullName,
        r.personalInfo.email,
        r.destination.name,
        r.checkIn,
        r.checkOut,
        r.pricing.total,
        r.status
    ]);
    
    let csv = headers.join(',') + '\n';
    csv += rows.map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reservas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    alert('✅ Exportado');
}

// ==================== DESTINOS MEJORADO CON ELIMINAR ====================

function loadDestinations() {
    const grid = document.getElementById('destinationsGrid');
    if (!grid) return;
    
    const destinations = getDestinations();
    
    if (destinations.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #6b7280;">
                <i class="fas fa-map-marked-alt" style="font-size: 64px; margin-bottom: 20px; opacity: 0.3;"></i>
                <h3 style="margin: 0 0 10px 0; font-size: 20px;">No hay destinos registrados</h3>
                <p style="margin: 0; font-size: 14px;">Comienza agregando tu primer destino turístico</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = destinations.map((d, i) => `
        <div class="destination-card" data-destination-id="${d.id}">
            <img src="${d.image}" alt="${d.name}" class="destination-image" onerror="this.src='../assets/img/placeholder.jpg'">
            <div class="destination-content">
                <span class="destination-type">${getServiceLabel(d.type)}</span>
                <h3 class="destination-name">${d.name}</h3>
                <div class="destination-location"><i class="fas fa-map-marker-alt"></i> ${d.location}</div>
                <div class="destination-price">${formatCurrency(d.price)} COP</div>
                <div class="destination-actions">
                    <button class="btn-secondary" onclick="editDestination('${d.id}')" title="Editar destino">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn-danger" onclick="deleteDestination('${d.id}')" title="Eliminar destino">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log(`✅ ${destinations.length} destinos cargados`);
}

// ✨ NUEVA FUNCIÓN: Eliminar destino
function deleteDestination(destinationId) {
    console.log('🗑️ Intentando eliminar destino:', destinationId);
    
    const destinations = getDestinations();
    const destination = destinations.find(d => d.id === destinationId);
    
    if (!destination) {
        alert('❌ Destino no encontrado');
        return;
    }
    
    // Confirmación con detalles del destino
    const confirmMessage = `¿Está seguro que desea eliminar este destino?

📍 Destino: ${destination.name}
📌 Ubicación: ${destination.location}
🏷️ Tipo: ${getServiceLabel(destination.type)}

⚠️ Esta acción no se puede deshacer.`;
    
    if (!confirm(confirmMessage)) {
        console.log('❌ Eliminación cancelada por el usuario');
        return;
    }
    
    // Verificar si hay reservas asociadas
    const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
    const relatedReservations = reservations.filter(r => 
        r.destination && r.destination.name === destination.name
    );
    
    if (relatedReservations.length > 0) {
        const warningMessage = `⚠️ ADVERTENCIA: Este destino tiene ${relatedReservations.length} reserva(s) asociada(s).

Si continúa, las reservas NO se eliminarán, pero harán referencia a un destino que ya no existe en el catálogo.

¿Desea continuar con la eliminación?`;
        
        if (!confirm(warningMessage)) {
            console.log('❌ Eliminación cancelada debido a reservas existentes');
            return;
        }
    }
    
    // Eliminar el destino
    const updatedDestinations = destinations.filter(d => d.id !== destinationId);
    saveDestinations(updatedDestinations);
    
    // Mostrar mensaje de éxito con animación
    const card = document.querySelector(`[data-destination-id="${destinationId}"]`);
    if (card) {
        card.style.transform = 'scale(0.8)';
        card.style.opacity = '0';
        card.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            loadDestinations();
            showSuccessToast(`✅ Destino "${destination.name}" eliminado exitosamente`);
        }, 300);
    } else {
        loadDestinations();
        showSuccessToast(`✅ Destino "${destination.name}" eliminado exitosamente`);
    }
    
    console.log('✅ Destino eliminado:', destination.name);
}

// ✨ NUEVA FUNCIÓN: Toast de éxito personalizado
function showSuccessToast(message) {
    const existingToast = document.querySelector('.success-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    
    toast.innerHTML = `
        <i class="fas fa-check-circle" style="font-size: 20px;"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
}

// Agregar animaciones CSS si no existen
if (!document.getElementById('toast-animations')) {
    const style = document.createElement('style');
    style.id = 'toast-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

function openDestinationModal(dest = null) {
    const modal = document.getElementById('destinationModal');
    const title = document.getElementById('destinationModalTitle');
    
    if (dest) {
        title.textContent = 'Editar Destino';
    } else {
        title.textContent = 'Nuevo Destino';
        document.getElementById('destinationForm').reset();
    }
    
    modal.classList.add('active');
}

function handleDestinationSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('destName').value.trim();
    const type = document.getElementById('destType').value;
    const price = parseFloat(document.getElementById('destPrice').value);
    const location = document.getElementById('destLocation').value.trim();
    const description = document.getElementById('destDescription').value.trim();
    const image = document.getElementById('destImage').value.trim() || '../assets/img/placeholder.jpg';
    
    if (!name || !type || !location || !description) {
        alert('⚠️ Por favor complete todos los campos obligatorios');
        return;
    }
    
    const destinations = getDestinations();
    
    const newDestination = {
        id: 'dest_' + Date.now(),
        name,
        type,
        price,
        location,
        description,
        image,
        createdAt: new Date().toISOString()
    };
    
    destinations.push(newDestination);
    saveDestinations(destinations);
    
    closeModal('destinationModal');
    loadDestinations();
    
    showSuccessToast(`✅ Destino "${name}" agregado exitosamente`);
    
    console.log('✅ Nuevo destino creado:', newDestination);
}

function editDestination(destinationId) {
    console.log('✏️ Editando destino:', destinationId);
    
    const destinations = getDestinations();
    const destination = destinations.find(d => d.id === destinationId);
    
    if (!destination) {
        alert('❌ Destino no encontrado');
        return;
    }
    
    // Llenar el formulario con los datos existentes
    document.getElementById('destName').value = destination.name;
    document.getElementById('destType').value = destination.type;
    document.getElementById('destPrice').value = destination.price;
    document.getElementById('destLocation').value = destination.location;
    document.getElementById('destDescription').value = destination.description;
    document.getElementById('destImage').value = destination.image;
    
    // Abrir modal en modo edición
    openDestinationModal(destination);
    
    // Modificar el comportamiento del submit para actualizar en lugar de crear
    const form = document.getElementById('destinationForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        // Actualizar destino
        destination.name = document.getElementById('destName').value.trim();
        destination.type = document.getElementById('destType').value;
        destination.price = parseFloat(document.getElementById('destPrice').value);
        destination.location = document.getElementById('destLocation').value.trim();
        destination.description = document.getElementById('destDescription').value.trim();
        destination.image = document.getElementById('destImage').value.trim();
        destination.updatedAt = new Date().toISOString();
        
        saveDestinations(destinations);
        closeModal('destinationModal');
        loadDestinations();
        
        showSuccessToast(`✅ Destino "${destination.name}" actualizado exitosamente`);
        
        // Restaurar el comportamiento original del submit
        form.onsubmit = handleDestinationSubmit;
    };
}

// ==================== USUARIOS ====================

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    console.log(`👥 Cargando ${users.length} usuarios`);
    
    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:40px;color:#6b7280;">Sin usuarios</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map((u, i) => {
        const initials = getInitials(u.fullName || 'Usuario');
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]')
            .filter(r => r.personalInfo.email === u.email).length;
        
        return `
            <tr>
                <td><div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#195C33,#0d3d20);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;">${initials}</div></td>
                <td><strong>${u.fullName}</strong></td>
                <td>${u.email}</td>
                <td>${u.phone || 'N/A'}</td>
                <td><span class="status-badge ${u.role === 'admin' ? 'status-confirmed' : 'status-pending'}">${u.role === 'admin' ? 'Admin' : 'Cliente'}</span></td>
                <td>${reservations}</td>
                <td>${formatDate(u.createdAt || new Date().toISOString())}</td>
                <td><span class="status-badge status-confirmed">Activo</span></td>
                <td>
                    <button class="action-btn btn-view" onclick="alert('Ver usuario')"><i class="fas fa-eye"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

// ==================== GRÁFICOS OPTIMIZADOS ====================

function initializeCharts() {
    console.log('📊 Inicializando gráficos...');
    
    if (adminState.charts.reservations || adminState.charts.services) {
        console.log('⚠️ Gráficos ya creados, actualizando datos...');
        updateCharts();
        return;
    }
    
    const reservationsCtx = document.getElementById('reservationsChart');
    if (reservationsCtx) {
        const allRes = JSON.parse(localStorage.getItem('reservations') || '[]');
        const { labels, data } = getChartData(allRes, adminState.dashboardPeriod);
        
        adminState.charts.reservations = new Chart(reservationsCtx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Reservas',
                    data,
                    borderColor: '#195C33',
                    backgroundColor: 'rgba(25,92,51,0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                animation: { duration: 300 },
                plugins: { legend: { display: false } },
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        ticks: { 
                            precision: 0,
                            maxTicksLimit: 6
                        }
                    },
                    x: {
                        ticks: {
                            maxTicksLimit: 8
                        }
                    }
                }
            }
        });
    }
    
    const servicesCtx = document.getElementById('servicesChart');
    if (servicesCtx) {
        const allRes = JSON.parse(localStorage.getItem('reservations') || '[]');
        const { startDate, endDate } = getDateRangeForPeriod(adminState.dashboardPeriod);
        const res = filterByDateRange(allRes, startDate, endDate);
        
        const counts = { parque: 0, mirador: 0, glamping: 0, hospedaje: 0 };
        res.forEach(r => { if (counts[r.serviceType] !== undefined) counts[r.serviceType]++; });
        
        adminState.charts.services = new Chart(servicesCtx, {
            type: 'doughnut',
            data: {
                labels: ['Parques','Miradores','Glamping','Hospedaje'],
                datasets: [{
                    data: [counts.parque, counts.mirador, counts.glamping, counts.hospedaje],
                    backgroundColor: ['#10b981','#3b82f6','#f59e0b','#8b5cf6'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1.5,
                animation: { duration: 300 },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    }
    
    console.log('✅ Gráficos inicializados');
}

function getChartData(reservations, period) {
    const labels = [];
    const data = [];
    
    if (period === 'week') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('es', { weekday: 'short' }));
            
            const count = reservations.filter(r => {
                const rDate = new Date(r.timestamp);
                return rDate.toDateString() === date.toDateString();
            }).length;
            data.push(count);
        }
    } else if (period === 'biweekly') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 2));
            labels.push(`${date.getDate()}/${date.getMonth() + 1}`);
            
            const count = reservations.filter(r => {
                const rDate = new Date(r.timestamp);
                const d1 = new Date(date);
                const d2 = new Date(date);
                d2.setDate(d1.getDate() + 1);
                return rDate.toDateString() === d1.toDateString() || rDate.toDateString() === d2.toDateString();
            }).length;
            data.push(count);
        }
    } else {
        for (let i = 3; i >= 0; i--) {
            const start = new Date();
            start.setDate(start.getDate() - (i * 7 + 6));
            const end = new Date();
            end.setDate(end.getDate() - (i * 7));
            
            labels.push(`Sem ${4 - i}`);
            
            const count = reservations.filter(r => {
                const rDate = new Date(r.timestamp);
                return rDate >= start && rDate <= end;
            }).length;
            data.push(count);
        }
    }
    
    return { labels, data };
}

function updateCharts() {
    const allRes = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    if (adminState.charts.reservations) {
        const { labels, data } = getChartData(allRes, adminState.dashboardPeriod);
        adminState.charts.reservations.data.labels = labels;
        adminState.charts.reservations.data.datasets[0].data = data;
        adminState.charts.reservations.update('none');
    }
    
    if (adminState.charts.services) {
        const { startDate, endDate } = getDateRangeForPeriod(adminState.dashboardPeriod);
        const res = filterByDateRange(allRes, startDate, endDate);
        
        const counts = { parque: 0, mirador: 0, glamping: 0, hospedaje: 0 };
        res.forEach(r => { if (counts[r.serviceType] !== undefined) counts[r.serviceType]++; });
        
        adminState.charts.services.data.datasets[0].data = [counts.parque, counts.mirador, counts.glamping, counts.hospedaje];
        adminState.charts.services.update('none');
    }
}

// ==================== MODALES ====================

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.closest('.modal').classList.remove('active');
    }
});

// ==================== REPORTES ====================

function generateReport(type) {
    alert(`Generando reporte de ${type}...`);
}

// ==================== UTILIDADES ====================

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO').format(Math.round(amount));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (seconds < 60) return `Hace ${seconds}s`;
    if (minutes < 60) return `Hace ${minutes}m`;
    if (hours < 24) return `Hace ${hours}h`;
    return `Hace ${days}d`;
}

function getServiceLabel(type) {
    const labels = { 'parque': 'Parque', 'mirador': 'Mirador', 'glamping': 'Glamping', 'hospedaje': 'Hospedaje' };
    return labels[type] || type;
}

console.log('✅ Dashboard JS v6.0 - Sistema de Gestión de Destinos Completo');
console.log('🔧 Funcionalidades disponibles:');
console.log('   - ✅ Crear nuevos destinos');
console.log('   - ✏️ Editar destinos existentes');
console.log('   - 🗑️ Eliminar destinos');
console.log('   - 💾 Persistencia en localStorage');
console.log('   - 🔔 Sistema de notificaciones en tiempo real');