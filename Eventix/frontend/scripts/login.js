 console.log('🔐 Inicializando login.html');

        // =============================================
        // VERIFICAR SI YA ESTÁ LOGUEADO
        // =============================================
        
        if (authAPI.isAuthenticated()) {
            console.log('✅ Usuario ya está logueado, redirigiendo...');
            showAuthNotification('Ya tienes una sesión activa', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }

        // =============================================
        // TOGGLE PASSWORD VISIBILITY
        // =============================================
        
        const togglePasswordBtn = document.getElementById('toggle-password');
        const passwordInput = document.getElementById('password');
        const eyeIconOpen = document.getElementById('eye-icon-open');
        const eyeIconClosed = document.getElementById('eye-icon-closed');

        togglePasswordBtn.addEventListener('click', () => {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIconOpen.classList.add('hidden');
                eyeIconClosed.classList.remove('hidden');
            } else {
                passwordInput.type = 'password';
                eyeIconOpen.classList.remove('hidden');
                eyeIconClosed.classList.add('hidden');
            }
        });

        // =============================================
        // VALIDACIÓN EN TIEMPO REAL
        // =============================================
        
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('email-error');

        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            
            if (!email) {
                showFieldError('email', 'El correo es obligatorio');
            } else if (!isValidEmail(email)) {
                showFieldError('email', 'Ingresa un correo válido');
            } else {
                hideFieldError('email');
            }
        });

        passwordInput.addEventListener('blur', () => {
            const password = passwordInput.value;
            
            if (!password) {
                showFieldError('password', 'La contraseña es obligatoria');
            } else if (password.length < 6) {
                showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
            } else {
                hideFieldError('password');
            }
        });

        // Limpiar errores al escribir
        emailInput.addEventListener('input', () => {
            if (emailInput.classList.contains('input-error')) {
                hideFieldError('email');
            }
        });

        passwordInput.addEventListener('input', () => {
            if (passwordInput.classList.contains('input-error')) {
                hideFieldError('password');
            }
        });

        // =============================================
        // MANEJO DEL FORMULARIO
        // =============================================
        
        const loginForm = document.getElementById('login-form');
        const loginBtn = document.getElementById('login-btn');
        const loginError = document.getElementById('login-error');
        const loginErrorMessage = document.getElementById('login-error-message');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            console.log('📝 Procesando formulario de login');

            // Limpiar errores previos
            hideAllErrors();

            // Obtener valores
            const email = emailInput.value.trim();
            const password = passwordInput.value;
            const rememberMe = document.getElementById('remember-me').checked;

            // Validación básica
            let hasErrors = false;

            if (!email) {
                showFieldError('email', 'El correo es obligatorio');
                hasErrors = true;
            } else if (!isValidEmail(email)) {
                showFieldError('email', 'Ingresa un correo válido');
                hasErrors = true;
            }

            if (!password) {
                showFieldError('password', 'La contraseña es obligatoria');
                hasErrors = true;
            } else if (password.length < 6) {
                showFieldError('password', 'La contraseña debe tener al menos 6 caracteres');
                hasErrors = true;
            }

            if (hasErrors) {
                console.log('❌ Errores en el formulario');
                return;
            }

            // Mostrar loading en el botón
            const originalBtnText = loginBtn.innerHTML;
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<svg class="w-5 h-5 inline mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Iniciando sesión...';

            try {
                // Llamar a la API
                const result = await authAPI.login(email, password);

                if (result.success) {
                    console.log('✅ Login exitoso');
                    
                    // Mostrar mensaje de éxito
                    showAuthNotification('¡Bienvenido de vuelta!', 'success');

                    // Esperar un momento y redirigir
                    setTimeout(() => {
                        // Redirigir al index o a la página anterior
                        const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
                        window.location.href = redirectUrl;
                    }, 1500);

                } else {
                    console.error('❌ Error en login:', result.error);
                    
                    // Mostrar error
                    showGeneralError(result.error);

                    // Restaurar botón
                    loginBtn.disabled = false;
                    loginBtn.innerHTML = originalBtnText;
                }

            } catch (error) {
                console.error('❌ Error inesperado:', error);
                showGeneralError('Error de conexión. Verifica tu conexión a internet.');
                
                // Restaurar botón
                loginBtn.disabled = false;
                loginBtn.innerHTML = originalBtnText;
            }
        });

        // =============================================
        // FUNCIONES AUXILIARES
        // =============================================
        
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }

        function showFieldError(field, message) {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}-error`);
            
            input.classList.add('input-error', 'border-red-500', 'focus:ring-red-500');
            input.classList.remove('border-gray-300');
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }

        function hideFieldError(field) {
            const input = document.getElementById(field);
            const errorElement = document.getElementById(`${field}-error`);
            
            input.classList.remove('input-error', 'border-red-500', 'focus:ring-red-500');
            input.classList.add('border-gray-300');
            errorElement.classList.add('hidden');
        }

        function showGeneralError(message) {
            loginErrorMessage.textContent = message;
            loginError.classList.remove('hidden');
            loginError.classList.add('animate-shake');
            
            // Remover animación después de que termine
            setTimeout(() => {
                loginError.classList.remove('animate-shake');
            }, 500);
            
            // Auto-ocultar después de 5 segundos
            setTimeout(() => {
                loginError.classList.add('hidden');
            }, 5000);
        }

        function hideAllErrors() {
            hideFieldError('email');
            hideFieldError('password');
            loginError.classList.add('hidden');
        }

        // =============================================
        // MOBILE MENU TOGGLE
        // =============================================
        
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');

        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        console.log('✅ login.html inicializado correctamente');

