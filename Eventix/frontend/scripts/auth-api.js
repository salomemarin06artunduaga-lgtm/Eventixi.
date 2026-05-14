// =============================================
// AUTH API - CONEXIÓN CON BACKEND
// TechStore Pro - Sistema de Autenticación
// ✨ VERSIÓN FINAL - Con notificaciones en tiempo real + UPDATE PROFILE
// =============================================

console.log('🔐 Inicializando auth-api.js FINAL');

// =============================================
// CONFIGURACIÓN DE LA API
// =============================================

const AUTH_CONFIG = {
    baseURL: 'http://localhost:5000/api/auth',
    timeout: 10000,
    storage: {
        tokenKey: 'techstore-auth-token',
        userKey: 'techstore-user-data',
        loginTimeKey: 'techstore-login-time'
    }
};

// =============================================
// CLASE PRINCIPAL: AuthAPI
// =============================================

class AuthAPI {
    
    constructor() {
        console.log('🔐 AuthAPI inicializada');
        this.baseURL = AUTH_CONFIG.baseURL;
        this.timeout = AUTH_CONFIG.timeout;
    }

    // =============================================
    // MÉTODO: REGISTRO DE USUARIO
    // =============================================
    
    async register(userData) {
        console.log('📝 Intentando registrar usuario:', userData.email);
        
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error en registro:', data.error);
                throw new Error(data.error || data.message || 'Error al registrar usuario');
            }

            console.log('✅ Usuario registrado exitosamente:', data.user.email);

            // ✨ CRÍTICO: Sincronizar con lista de usuarios Y disparar evento
            this.syncUserToLocalStorage(data.user, true); // true = es nuevo usuario

            // Luego guardar token y sesión del usuario
            this.saveAuthData(data.token, data.user);

            return {
                success: true,
                user: data.user,
                token: data.token,
                message: 'Usuario registrado exitosamente'
            };

        } catch (error) {
            console.error('❌ Error en register():', error);
            
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        }
    }

    // =============================================
    // MÉTODO: LOGIN DE USUARIO
    // =============================================
    
    async login(email, password) {
        console.log('🔑 Intentando login:', email);
        
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error en login:', data.error);
                throw new Error(data.error || data.message || 'Credenciales inválidas');
            }

            console.log('✅ Login exitoso:', data.user.email);

            // Sincronizar usuario (no es nuevo, solo actualizar)
            this.syncUserToLocalStorage(data.user, false);

            // Guardar token y datos del usuario
            this.saveAuthData(data.token, data.user);

            return {
                success: true,
                user: data.user,
                token: data.token,
                message: 'Inicio de sesión exitoso'
            };

        } catch (error) {
            console.error('❌ Error en login():', error);
            
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        }
    }

    // =============================================
    // MÉTODO: OBTENER PERFIL DEL USUARIO
    // =============================================
    
    async getProfile() {
        console.log('👤 Obteniendo perfil del usuario');
        
        const token = this.getToken();
        
        if (!token) {
            console.error('❌ No hay token de autenticación');
            return {
                success: false,
                error: 'No autenticado'
            };
        }

        const user = this.getUser();

        if (!user || !user.id) {
            console.error('❌ No hay datos de usuario almacenados');
            return {
                success: false,
                error: 'No hay datos de usuario'
            };
        }

        try {
            const response = await fetch(`${this.baseURL}/profile?userId=${user.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error obteniendo perfil:', data.error);
                
                if (response.status === 401) {
                    console.log('🔒 Token inválido o expirado, cerrando sesión...');
                    this.logout();
                }
                
                throw new Error(data.error || data.message || 'Error al obtener perfil');
            }

            console.log('✅ Perfil obtenido:', data.user.email);

            // Sincronizar con lista de usuarios (actualización)
            this.syncUserToLocalStorage(data.user, false);

            // Actualizar datos del usuario en localStorage
            this.saveUser(data.user);

            return {
                success: true,
                user: data.user
            };

        } catch (error) {
            console.error('❌ Error en getProfile():', error);
            
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        }
    }

    // =============================================
    // ✨ NUEVO: ACTUALIZAR PERFIL DEL USUARIO
    // =============================================
    
    async updateProfile(updateData) {
        console.log('📝 Actualizando perfil del usuario:', updateData);
        
        const token = this.getToken();
        
        if (!token) {
            console.error('❌ No hay token de autenticación');
            return {
                success: false,
                error: 'No autenticado'
            };
        }

        const currentUser = this.getUser();

        if (!currentUser || !currentUser.id) {
            console.error('❌ No hay datos de usuario almacenados');
            return {
                success: false,
                error: 'No hay datos de usuario'
            };
        }

        try {
            // Llamar al endpoint de actualización
            const response = await fetch(`${this.baseURL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: currentUser.id,
                    ...updateData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Error actualizando perfil:', data.error);
                
                if (response.status === 401) {
                    console.log('🔒 Token inválido o expirado, cerrando sesión...');
                    this.logout();
                }
                
                throw new Error(data.error || data.message || 'Error al actualizar perfil');
            }

            console.log('✅ Perfil actualizado exitosamente:', data.user.email);

            // Combinar datos actuales con los nuevos
            const updatedUser = {
                ...currentUser,
                ...data.user
            };

            // Sincronizar con lista de usuarios (actualización)
            this.syncUserToLocalStorage(updatedUser, false);

            // Actualizar datos del usuario en localStorage
            this.saveUser(updatedUser);

            // Disparar evento de actualización
            window.dispatchEvent(new CustomEvent('userProfileUpdated', { 
                detail: { user: updatedUser } 
            }));

            return {
                success: true,
                user: updatedUser,
                message: 'Perfil actualizado exitosamente'
            };

        } catch (error) {
            console.error('❌ Error en updateProfile():', error);
            
            return {
                success: false,
                error: error.message || 'Error de conexión con el servidor'
            };
        }
    }

    // =============================================
    // MÉTODO: LOGOUT (CERRAR SESIÓN)
    // =============================================
    
    logout() {
        console.log('🚪 Cerrando sesión...');
        
        localStorage.removeItem(AUTH_CONFIG.storage.tokenKey);
        localStorage.removeItem(AUTH_CONFIG.storage.userKey);
        localStorage.removeItem(AUTH_CONFIG.storage.loginTimeKey);

        console.log('✅ Sesión cerrada exitosamente');

        window.dispatchEvent(new CustomEvent('userLoggedOut'));

        return {
            success: true,
            message: 'Sesión cerrada exitosamente'
        };
    }

    // =============================================
    // ✨ CORREGIDO: SINCRONIZAR USUARIO CON NOTIFICACIONES
    // =============================================
    
    /**
     * Sincronizar usuario con la lista de usuarios en localStorage
     * Y DISPARAR EVENTO DE STORAGE para notificaciones en tiempo real
     * 
     * @param {Object} user - Datos del usuario del backend
     * @param {Boolean} isNew - ¿Es un usuario nuevo? (registro vs login)
     */
    syncUserToLocalStorage(user, isNew = false) {
        console.log('🔄 Sincronizando usuario con localStorage:', user.email);
        
        try {
            // Cargar lista de usuarios existente
            let users = JSON.parse(localStorage.getItem('users') || '[]');
            console.log(`📊 Usuarios actuales: ${users.length}`);
            
            // Normalizar datos del usuario para el dashboard
            const normalizedUser = {
                id: user.id || user._id || ('user_' + Date.now()),
                fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email,
                phone: user.phone || '',
                role: user.role || 'user',
                createdAt: user.createdAt || new Date().toISOString(),
                status: user.status || 'active'
            };
            
            // Buscar si el usuario ya existe (por email)
            const existingIndex = users.findIndex(u => u.email === user.email);
            
            if (existingIndex >= 0) {
                // Actualizar usuario existente
                users[existingIndex] = {
                    ...users[existingIndex],
                    ...normalizedUser,
                    updatedAt: new Date().toISOString()
                };
                console.log('🔄 Usuario actualizado en localStorage');
            } else {
                // Agregar nuevo usuario
                users.push(normalizedUser);
                console.log('✅ Nuevo usuario agregado a localStorage');
            }
            
            // ✨ PASO 1: Guardar lista actualizada
            localStorage.setItem('users', JSON.stringify(users));
            console.log(`📊 Total usuarios después de sync: ${users.length}`);
            
            // ✨ PASO 2: DISPARAR EVENTO DE STORAGE (CRÍTICO PARA NOTIFICACIONES)
            // Este es el paso que faltaba para las notificaciones en tiempo real
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'users',
                newValue: JSON.stringify(users),
                oldValue: null, // No necesitamos el valor anterior
                url: window.location.href,
                storageArea: localStorage
            }));
            console.log('📡 Evento de storage disparado para notificaciones');
            
            // ✨ PASO 3: Evento personalizado (opcional, para otros usos)
            window.dispatchEvent(new CustomEvent('userSynced', { 
                detail: { 
                    user: normalizedUser, 
                    isNew: existingIndex < 0,
                    isRegistration: isNew 
                } 
            }));
            
            if (isNew && existingIndex < 0) {
                console.log('🎉 ¡Nuevo usuario registrado! Dashboard debería mostrar notificación');
            }
            
        } catch (error) {
            console.error('❌ Error sincronizando usuario:', error);
        }
    }

    // =============================================
    // ✨ NUEVO: SINCRONIZAR TODOS LOS USUARIOS DEL BACKEND
    // =============================================
    
    async syncAllUsersFromBackend() {
        console.log('🔄 Sincronizando todos los usuarios desde backend...');
        
        const token = this.getToken();
        
        if (!token) {
            console.warn('⚠️ No hay token, saltando sincronización');
            return [];
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener usuarios del backend');
            }

            const backendUsers = await response.json();
            console.log(`📥 Recibidos ${backendUsers.length} usuarios del backend`);

            const normalizedUsers = backendUsers.map(u => ({
                id: u.id || u._id,
                fullName: u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
                firstName: u.firstName || '',
                lastName: u.lastName || '',
                email: u.email,
                phone: u.phone || '',
                role: u.role || 'user',
                createdAt: u.createdAt,
                status: u.status || 'active'
            }));

            localStorage.setItem('users', JSON.stringify(normalizedUsers));
            console.log(`✅ ${normalizedUsers.length} usuarios sincronizados`);

            return normalizedUsers;

        } catch (error) {
            console.error('❌ Error sincronizando usuarios:', error);
            return [];
        }
    }

    // =============================================
    // MÉTODOS AUXILIARES - MANEJO DE DATOS
    // =============================================
    
    saveAuthData(token, user) {
        console.log('💾 Guardando datos de autenticación');
        
        try {
            localStorage.setItem(AUTH_CONFIG.storage.tokenKey, token);
            localStorage.setItem(AUTH_CONFIG.storage.userKey, JSON.stringify(user));
            localStorage.setItem(AUTH_CONFIG.storage.loginTimeKey, new Date().toISOString());
            
            console.log('✅ Datos guardados en localStorage');
            console.log('   Token:', token.substring(0, 20) + '...');
            console.log('   Usuario:', user.email);

            window.dispatchEvent(new CustomEvent('userLoggedIn', { 
                detail: { user } 
            }));

        } catch (error) {
            console.error('❌ Error guardando datos:', error);
        }
    }

    saveUser(user) {
        try {
            localStorage.setItem(AUTH_CONFIG.storage.userKey, JSON.stringify(user));
            console.log('✅ Datos de usuario actualizados');
        } catch (error) {
            console.error('❌ Error guardando usuario:', error);
        }
    }

    getToken() {
        return localStorage.getItem(AUTH_CONFIG.storage.tokenKey);
    }

    getUser() {
        try {
            const userStr = localStorage.getItem(AUTH_CONFIG.storage.userKey);
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('❌ Error obteniendo usuario:', error);
            return null;
        }
    }

    isAuthenticated() {
        const token = this.getToken();
        const user = this.getUser();
        const isAuth = !!(token && user);
        
        console.log('🔍 ¿Usuario autenticado?', isAuth);
        return isAuth;
    }

    async verifyToken() {
        console.log('🔍 Verificando validez del token');
        
        if (!this.isAuthenticated()) {
            console.log('❌ No hay sesión activa');
            return false;
        }

        const result = await this.getProfile();
        
        if (!result.success) {
            console.log('❌ Token inválido o expirado');
            this.logout();
            return false;
        }

        console.log('✅ Token válido');
        return true;
    }

    getTimeSinceLogin() {
        const loginTime = localStorage.getItem(AUTH_CONFIG.storage.loginTimeKey);
        
        if (!loginTime) return null;
        
        const now = new Date();
        const login = new Date(loginTime);
        const diffMs = now - login;
        const diffMins = Math.floor(diffMs / 60000);
        
        return diffMins;
    }

    // =============================================
    // ✨ FUNCIÓN AUXILIAR: MOSTRAR NOTIFICACIONES
    // =============================================
    
    showNotification(message, type = 'info') {
        console.log(`📢 Notificación [${type}]: ${message}`);
        
        const toast = document.createElement('div');
        
        let bgColor, icon;
        
        switch(type) {
            case 'success':
                bgColor = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
                icon = '✅';
                break;
            case 'error':
                bgColor = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
                icon = '❌';
                break;
            case 'warning':
                bgColor = 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
                icon = '⚠️';
                break;
            default:
                bgColor = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                icon = 'ℹ️';
        }
        
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${bgColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            font-weight: 600;
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        toast.innerHTML = `<span style="font-size: 20px;">${icon}</span> ${message}`;
        
        document.body.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 10);
        
        // Animación de salida
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// =============================================
// INSTANCIA GLOBAL
// =============================================

const authAPI = new AuthAPI();
window.authAPI = authAPI;

console.log('✅ auth-api.js FINAL cargado exitosamente');

// =============================================
// FUNCIONES AUXILIARES GLOBALES
// =============================================

function showAuthNotification(message, type = 'info') {
    authAPI.showNotification(message, type);
}

window.showAuthNotification = showAuthNotification;

// =============================================
// ✨ FUNCIONES DE TESTING
// =============================================

window.crearUsuarioPrueba = function() {
    const random = Math.floor(Math.random() * 10000);
    const testUser = {
        id: 'user_' + Date.now(),
        fullName: `Test User ${random}`,
        firstName: 'Test',
        lastName: `User ${random}`,
        email: `test${random}@example.com`,
        phone: `300${random}`,
        role: 'user',
        createdAt: new Date().toISOString(),
        status: 'active'
    };
    
    // Sincronizar con evento de storage (isNew = true)
    authAPI.syncUserToLocalStorage(testUser, true);
    
    console.log('✅ Usuario de prueba creado:', testUser.email);
    console.log('🔔 Dashboard debería mostrar notificación en tiempo real');
    alert('✅ Usuario creado: ' + testUser.email + '\n🔔 Revisa el dashboard!');
    
    return testUser;
};

window.verUsuarios = function() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    console.table(users);
    console.log(`Total: ${users.length} usuarios`);
    return users;
};

window.limpiarUsuarios = function() {
    if (confirm('¿Eliminar TODOS los usuarios de localStorage?')) {
        localStorage.setItem('users', '[]');
        console.log('🗑️ Usuarios eliminados');
        alert('✅ Usuarios eliminados');
    }
};

window.testActualizarPerfil = async function() {
    const updateData = {
        firstName: 'Nombre Actualizado',
        lastName: 'Apellido Actualizado',
        phone: '+57 300 999 8888'
    };
    
    console.log('🧪 Probando actualización de perfil...');
    const result = await authAPI.updateProfile(updateData);
    
    if (result.success) {
        console.log('✅ Perfil actualizado:', result.user);
        alert('✅ Perfil actualizado exitosamente!');
    } else {
        console.error('❌ Error:', result.error);
        alert('❌ Error: ' + result.error);
    }
    
    return result;
};

// =============================================
// LOG FINAL
// =============================================

console.log('');
console.log('🎉 ========================================');
console.log('   AUTH-API.JS FINAL - CARGADO');
console.log('   ✨ CON NOTIFICACIONES + UPDATE PROFILE');
console.log('========================================');
console.log('');
console.log('📌 Instancia: window.authAPI');
console.log('');
console.log('🔧 Métodos principales:');
console.log('   • authAPI.register(userData)');
console.log('   • authAPI.login(email, password)');
console.log('   • authAPI.getProfile()');
console.log('   • authAPI.updateProfile(updateData) ← NUEVO');
console.log('   • authAPI.logout()');
console.log('   • authAPI.showNotification(msg, type) ← NUEVO');
console.log('');
console.log('✨ Métodos de sincronización:');
console.log('   • authAPI.syncUserToLocalStorage(user, isNew)');
console.log('   • authAPI.syncAllUsersFromBackend()');
console.log('');
console.log('🧪 Funciones de testing:');
console.log('   • window.crearUsuarioPrueba()');
console.log('   • window.testActualizarPerfil() ← NUEVO');
console.log('   • window.verUsuarios()');
console.log('   • window.limpiarUsuarios()');
console.log('');
console.log('🔔 EVENTOS disparados:');
console.log('   • userLoggedIn - Al iniciar sesión');
console.log('   • userLoggedOut - Al cerrar sesión');
console.log('   • userProfileUpdated - Al actualizar perfil ← NUEVO');
console.log('   • userSynced - Al sincronizar usuario');
console.log('========================================');
console.log('');