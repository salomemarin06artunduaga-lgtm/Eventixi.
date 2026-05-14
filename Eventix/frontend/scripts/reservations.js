// ==================== CONFIGURACIÓN Y DATOS ====================

const destinationsCatalog = {
    parque: [
        {
            id: 'parque-1',
            name: 'Xhimanut - Parque de los Sueños',
            location: 'Gigante, Huila',
            price: 35000,
            image: '../assets/img/parque_xhimnaut_123.jpg',
            description: 'Parque temático con +30 atracciones, cine acuático y senderos ecológicos'
        },
        {
            id: 'parque-2',
            name: 'Los Pinos - Parque Agroecoturístico',
            location: 'Hobo - Gigante',
            price: 25000,
            image: '../assets/img/los_pinos.jpg',
            description: 'Eco hotel sustentable en bosque de pinos con senderos y glamping'
        },
        {
            id: 'parque-3',
            name: 'Brisas de Mirthayú',
            location: 'Vía Zuluaga, Gigante',
            price: 5000,
            image: '../assets/img/brisa_marthayu.jpg',
            description: 'Finca agroturística con escultura de la Diosa Mirthayú y piscina'
        }
    ],
    mirador: [
        {
            id: 'mirador-1',
            name: 'La Mano del Gigante',
            location: 'Vereda El Rodeo, Gigante',
            price: 21000,
            image: '../assets/img/la_mano_gigante_fondo.jpg',
            description: 'Mirador icónico con deslizador de 210m y columpio sobre el barranco'
        },
        {
            id: 'mirador-2',
            name: 'La Loma de la Cruz',
            location: 'Gigante, Huila',
            price: 0,
            image: '../assets/img/loma_cruz_gigante.jpg',
            description: 'Mirador natural con vista 360° del Valle del Magdalena'
        },
        {
            id: 'mirador-3',
            name: 'La Morra - Mirador 360°',
            location: 'Cordillera Oriental, Gigante',
            price: 15000,
            image: '../assets/img/la_morra.jpg',
            description: 'Vistas al Nevado del Huila, Puracé y represas del Quimbo'
        },
        {
            id: 'mirador-4',
            name: 'La Casa del Árbol',
            location: 'Gigante, Huila',
            price: 10000,
            image: '../assets/img/la_casa_arbol.jpg',
            description: 'Mirador en árbol con cascada, canoa y senderismo ecológico'
        }
    ],
    glamping: [
        {
            id: 'glamping-1',
            name: 'Los Pinos - Glampinos y Alpinos',
            location: 'Hobo - Gigante',
            price: 180000,
            image: '../assets/img/los_pinos.jpg',
            description: 'Tarimas en madera con hamacas inmersas en bosque de pinos'
        },
        {
            id: 'glamping-2',
            name: 'La Morra - Glamping de Pareja',
            location: 'Cordillera Oriental, Gigante',
            price: 250000,
            image: '../assets/img/la_morra.jpg',
            description: 'Glamping romántico con jacuzzi, malla elevada y vistas al nevado'
        }
    ],
    hospedaje: [
        {
            id: 'hospedaje-1',
            name: 'La Perla Finca Hotel',
            location: 'Vereda Bajo Corozal, Gigante',
            price: 280000,
            image: '../assets/img/perla_finca_gigante.jpg',
            description: 'Hotel boutique en Ruta del Café con cabañas de lujo entre cafetales'
        },
        {
            id: 'hospedaje-2',
            name: 'Los Pinos - Cabañas Ecológicas',
            location: 'Hobo - Gigante',
            price: 150000,
            image: '../assets/img/los_pinos.jpg',
            description: 'Cabañas en pino con vistas espectaculares y diseño sostenible'
        },
        {
            id: 'hospedaje-3',
            name: 'La Morra - Cabañas Confortables',
            location: 'Cordillera Oriental, Gigante',
            price: 120000,
            image: '../assets/img/la_morra.jpg',
            description: 'Hospedaje acogedor con vistas panorámicas de 360 grados'
        },
        {
            id: 'hospedaje-4',
            name: 'Brisas de Mirthayú - Finca Agroturística',
            location: 'Vía Zuluaga, Gigante',
            price: 100000,
            image: '../assets/img/brisa_marthayu.jpg',
            description: 'Cabañas con desayuno incluido, piscina e hidropedales'
        }
    ]
};

const pricingConfig = {
    serviceFeePercentage: 0.05,
    taxPercentage: 0.19,
    minNights: 1,
    maxNights: 30
};

// ==================== ESTADO DE LA APLICACIÓN ====================

let appState = {
    selectedServiceType: null,
    selectedDestination: null,
    checkInDate: null,
    checkOutDate: null,
    numPeople: null,
    paymentMethod: null,
    currentDestinations: [],
    userData: null,
    companions: []
};

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeReservationSystem();
});

function initializeReservationSystem() {
    loadUserData();
    setMinDates();
    setupReservationListeners();
    
    console.log('✅ Sistema de reservas inicializado correctamente');
}

// ==================== GESTIÓN DE USUARIO ====================

function loadUserData() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || 'null');
    
    if (userData) {
        appState.userData = userData;
        
        const fullNameField = document.getElementById('fullName');
        const emailField = document.getElementById('email');
        
        if (fullNameField && userData.fullName) {
            fullNameField.value = userData.fullName;
        }
        
        if (emailField && userData.email) {
            emailField.value = userData.email;
        }
        
        console.log('✅ Datos de usuario cargados:', userData.fullName);
    }
}

// ==================== CONFIGURACIÓN DE FECHAS ====================

function setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) checkInInput.min = todayStr;
    if (checkOutInput) checkOutInput.min = tomorrowStr;
}

// ==================== EVENT LISTENERS (SOLO RESERVAS) ====================

function setupReservationListeners() {
    // Tipo de servicio
    document.querySelectorAll('.service-type-card:not(.payment-method-card)').forEach(card => {
        card.addEventListener('click', function(e) {
            selectServiceType(this.dataset.type);
        });
    });
    
    // Selección de destino
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) {
        destinationSelect.addEventListener('change', function() {
            selectDestination(this.value);
        });
    }
    
    // Fechas
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    
    if (checkInInput) {
        checkInInput.addEventListener('change', function() {
            handleCheckInChange(this.value);
        });
    }
    
    if (checkOutInput) {
        checkOutInput.addEventListener('change', function() {
            handleCheckOutChange(this.value);
        });
    }
    
    // Número de personas
    document.querySelectorAll('.people-option').forEach(option => {
        option.addEventListener('click', function() {
            selectPeople(this.dataset.value);
        });
    });
    
    // Método de pago
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.addEventListener('click', function(e) {
            selectPaymentMethod(this.dataset.payment, this);
        });
    });
    
    // Validaciones en tiempo real
    setupRealtimeValidations();
    
    // Submit del formulario
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}

// ==================== VALIDACIONES EN TIEMPO REAL ====================

function setupRealtimeValidations() {
    const fullNameInput = document.getElementById('fullName');
    if (fullNameInput) {
        fullNameInput.addEventListener('input', function(e) {
            validateName(e.target);
        });
        fullNameInput.addEventListener('blur', function(e) {
            validateName(e.target, true);
        });
    }
    
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            validatePhone(e.target);
        });
        phoneInput.addEventListener('blur', function(e) {
            validatePhone(e.target, true);
        });
    }
    
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('input', function(e) {
            validateEmail(e.target);
        });
        emailInput.addEventListener('blur', function(e) {
            validateEmail(e.target, true);
        });
    }
    
    const docTypeInput = document.getElementById('documentType');
    const docNumberInput = document.getElementById('documentNumber');
    
    if (docTypeInput && docNumberInput) {
        docTypeInput.addEventListener('change', function() {
            validateDocumentNumber(docNumberInput);
        });
        
        docNumberInput.addEventListener('input', function(e) {
            validateDocumentNumber(e.target);
        });
    }
    
    const emergencyContactInput = document.getElementById('emergencyContact');
    if (emergencyContactInput) {
        emergencyContactInput.addEventListener('input', function(e) {
            validateName(e.target);
        });
    }
    
    const emergencyPhoneInput = document.getElementById('emergencyPhone');
    if (emergencyPhoneInput) {
        emergencyPhoneInput.addEventListener('input', function(e) {
            validatePhone(e.target);
        });
    }
}

function validateName(input, showError = false) {
    if (!input) return false;
    
    const value = input.value.trim();
    const regex = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
    
    input.value = input.value.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
    
    if (value.length === 0) {
        if (showError) showFieldError(input, 'Este campo es obligatorio');
        return false;
    }
    
    if (value.length < 3) {
        if (showError) showFieldError(input, 'Debe tener al menos 3 caracteres');
        return false;
    }
    
    if (!regex.test(value)) {
        if (showError) showFieldError(input, 'Solo se permiten letras y espacios');
        return false;
    }
    
    const words = value.split(' ').filter(w => w.length > 0);
    if (words.length < 2) {
        if (showError) showFieldError(input, 'Ingresa nombre y apellido completo');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validatePhone(input, showError = false) {
    if (!input) return false;
    
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 10) {
        value = value.slice(0, 10);
    }
    
    input.value = value;
    
    if (value.length === 0) {
        if (showError) {
            showFieldError(input, 'El teléfono es obligatorio (10 dígitos)');
        }
        return false;
    }
    
    if (value.length === 10) {
        clearFieldError(input);
        return true;
    }
    
    if (showError) {
        showFieldError(input, `Faltan ${10 - value.length} dígitos (debe tener 10)`);
        return false;
    }
    
    return false;
}

function validateEmail(input, showError = false) {
    if (!input) return false;
    
    const value = input.value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value.length === 0) {
        if (showError) showFieldError(input, 'El correo electrónico es obligatorio');
        return false;
    }
    
    if (!emailRegex.test(value)) {
        if (showError) showFieldError(input, 'Formato de correo inválido (debe contener @)');
        return false;
    }
    
    clearFieldError(input);
    return true;
}

function validateDocumentNumber(input) {
    if (!input) return false;
    
    const docType = document.getElementById('documentType').value;
    let value = input.value.replace(/\D/g, '');
    
    if (!docType) {
        input.value = '';
        return false;
    }
    
    const maxLengths = {
        'CC': 10,
        'CE': 7,
        'PA': 12,
        'TI': 11
    };
    
    const maxLength = maxLengths[docType] || 12;
    
    if (value.length > maxLength) {
        value = value.slice(0, maxLength);
    }
    
    input.value = value;
    
    if (value.length >= 6) {
        clearFieldError(input);
        return true;
    }
    
    return false;
}

function showFieldError(input, message) {
    if (!input) return;
    
    const parent = input.closest('.form-group');
    if (!parent) return;
    
    clearFieldError(input);
    
    input.style.borderColor = '#ef4444';
    input.style.boxShadow = '0 0 0 4px rgba(239, 68, 68, 0.1)';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.cssText = 'color: #ef4444; font-size: 13px; margin-top: 6px; display: flex; align-items: center; gap: 6px;';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
    
    parent.appendChild(errorDiv);
}

function clearFieldError(input) {
    if (!input) return;
    
    const parent = input.closest('.form-group');
    if (!parent) return;
    
    input.style.borderColor = '#e5e7eb';
    input.style.boxShadow = 'none';
    
    const errorDiv = parent.querySelector('.field-error');
    if (errorDiv) {
        errorDiv.remove();
    }
}

// ==================== GESTIÓN DE ACOMPAÑANTES ====================

function selectPeople(value) {
    appState.numPeople = value;
    
    document.querySelectorAll('.people-option').forEach(option => {
        option.classList.remove('active');
    });
    
    const clickedOption = Array.from(document.querySelectorAll('.people-option')).find(
        opt => opt.dataset.value === value
    );
    if (clickedOption) {
        clickedOption.classList.add('active');
    }
    
    const numPeopleInput = document.getElementById('numPeople');
    if (numPeopleInput) numPeopleInput.value = value;
    
    const summaryPeople = document.getElementById('summaryPeople');
    if (summaryPeople) {
        summaryPeople.textContent = value === '6+' ? '6+ personas' : `${value} ${value === '1' ? 'persona' : 'personas'}`;
    }
    
    const numericValue = value === '6+' ? 6 : parseInt(value);
    const numCompanions = numericValue - 1;
    
    updateCompanionsSection(numCompanions);
    calculateTotalPrice();
    
    console.log('✅ Número de personas seleccionado:', value);
}

function updateCompanionsSection(numCompanions) {
    let companionsSection = document.getElementById('companions-section');
    
    if (numCompanions <= 0) {
        if (companionsSection) {
            companionsSection.style.display = 'none';
        }
        appState.companions = [];
        return;
    }
    
    if (!companionsSection) {
        companionsSection = createCompanionsSection();
    }
    
    companionsSection.style.display = 'block';
    
    const container = document.getElementById('companions-container');
    if (container) {
        container.innerHTML = '';
        
        for (let i = 0; i < numCompanions; i++) {
            const companionForm = createCompanionForm(i + 1);
            container.appendChild(companionForm);
        }
    }
}

function createCompanionsSection() {
    const personalInfoSection = document.querySelector('.form-section:has(#fullName)');
    
    const section = document.createElement('div');
    section.id = 'companions-section';
    section.className = 'form-section';
    section.style.display = 'none';
    section.innerHTML = `
        <h2 class="section-title">
            <i class="fas fa-user-friends"></i>
            Información de Acompañantes
        </h2>
        <div class="info-box" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left-color: #3b82f6; margin-bottom: 20px;">
            <p style="color: #1e40af;">
                <i class="fas fa-info-circle" style="color: #3b82f6;"></i>
                <strong>Nota:</strong> Por razones de seguridad y registro, necesitamos los datos básicos de cada acompañante.
            </p>
        </div>
        <div id="companions-container"></div>
    `;
    
    if (personalInfoSection) {
        personalInfoSection.insertAdjacentElement('afterend', section);
    }
    return section;
}

function createCompanionForm(index) {
    const div = document.createElement('div');
    div.className = 'companion-card';
    div.style.cssText = 'background: #f9fafb; padding: 24px; border-radius: 16px; margin-bottom: 20px; border: 2px solid #e5e7eb;';
    
    div.innerHTML = `
        <h3 style="font-size: 16px; font-weight: 700; color: #195C33; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #F4C400 0%, #FFE347 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #195C33; font-weight: 800; font-size: 14px;">
                ${index}
            </div>
            Acompañante #${index}
        </h3>
        
        <div class="form-row">
            <div class="form-group">
                <label>Nombre Completo <span class="required">*</span></label>
                <input 
                    type="text" 
                    id="companion-name-${index}" 
                    class="form-input companion-input" 
                    placeholder="Ej: María García López"
                    data-validation="name"
                    required
                >
            </div>
            
            <div class="form-group">
                <label>Tipo de Documento <span class="required">*</span></label>
                <select id="companion-doctype-${index}" class="form-select companion-input" required>
                    <option value="">Seleccione...</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                    <option value="TI">Tarjeta de Identidad</option>
                </select>
            </div>
        </div>
        
        <div class="form-group">
            <label>Número de Documento <span class="required">*</span></label>
            <input 
                type="text" 
                id="companion-docnum-${index}" 
                class="form-input companion-input" 
                placeholder="Número de documento"
                data-companion-index="${index}"
                required
            >
        </div>
    `;
    
    setTimeout(() => {
        const nameInput = div.querySelector(`#companion-name-${index}`);
        if (nameInput) {
            nameInput.addEventListener('input', (e) => validateName(e.target));
            nameInput.addEventListener('blur', (e) => validateName(e.target, true));
        }
        
        const docNumInput = div.querySelector(`#companion-docnum-${index}`);
        const docTypeSelect = div.querySelector(`#companion-doctype-${index}`);
        
        if (docTypeSelect && docNumInput) {
            docTypeSelect.addEventListener('change', () => validateDocumentNumber(docNumInput));
            docNumInput.addEventListener('input', (e) => validateDocumentNumber(e.target));
        }
    }, 100);
    
    return div;
}

// ==================== SELECCIÓN DE TIPO DE SERVICIO ====================

function selectServiceType(type) {
    appState.selectedServiceType = type;
    
    document.querySelectorAll('.service-type-card:not(.payment-method-card)').forEach(card => {
        card.classList.remove('active');
    });
    
    const selectedCard = Array.from(document.querySelectorAll('.service-type-card:not(.payment-method-card)')).find(
        card => card.dataset.type === type
    );
    if (selectedCard) {
        selectedCard.classList.add('active');
    }
    
    const serviceTypeInput = document.getElementById('serviceType');
    if (serviceTypeInput) serviceTypeInput.value = type;
    
    loadDestinations(type);
    updateServiceBadge(type);
    
    const destinationSelect = document.getElementById('destination');
    if (destinationSelect) destinationSelect.disabled = false;
    
    console.log('✅ Tipo de servicio seleccionado:', type);
}

function updateServiceBadge(type) {
    const badges = {
        parque: '🌳 Parques Naturales',
        mirador: '🏔️ Miradores',
        glamping: '⛺ Glamping',
        hospedaje: '🏨 Hospedaje'
    };
    
    const serviceBadge = document.getElementById('serviceBadge');
    if (serviceBadge) {
        serviceBadge.textContent = badges[type] || 'Servicio';
    }
}

// ==================== GESTIÓN DE DESTINOS ====================

function loadDestinations(serviceType) {
    const destinations = destinationsCatalog[serviceType] || [];
    appState.currentDestinations = destinations;
    
    const select = document.getElementById('destination');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Selecciona un destino --</option>';
    
    destinations.forEach(dest => {
        const option = document.createElement('option');
        option.value = dest.id;
        option.textContent = `${dest.name} - ${formatCurrency(dest.price)} COP/noche`;
        option.setAttribute('data-image', dest.image);
        option.setAttribute('data-description', dest.description);
        select.appendChild(option);
    });
    
    resetDestinationPreview();
    console.log(`✅ ${destinations.length} destinos cargados para ${serviceType}`);
}

function selectDestination(destinationId) {
    const destination = appState.currentDestinations.find(d => d.id === destinationId);
    
    if (destination) {
        appState.selectedDestination = destination;
        
        const previewImage = document.getElementById('previewImage');
        const previewName = document.getElementById('previewName');
        const previewLocation = document.getElementById('previewLocation');
        
        if (previewImage) {
            previewImage.style.opacity = '0';
            
            setTimeout(() => {
                previewImage.src = destination.image;
                previewImage.alt = destination.name;
                previewImage.style.transition = 'opacity 0.5s ease';
                previewImage.style.opacity = '1';
            }, 200);
        }
        
        if (previewName) previewName.textContent = destination.name;
        if (previewLocation) previewLocation.textContent = destination.location;
        
        const summary = document.querySelector('.reservation-summary');
        if (summary) {
            summary.style.boxShadow = '0 12px 40px rgba(25, 92, 51, 0.2)';
            setTimeout(() => {
                summary.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.08)';
            }, 1000);
        }
        
        calculateTotalPrice();
        console.log('✅ Destino seleccionado:', destination.name);
    } else {
        appState.selectedDestination = null;
        resetDestinationPreview();
    }
}

// ==================== GESTIÓN DE FECHAS ====================

function handleCheckInChange(date) {
    appState.checkInDate = date;
    
    const checkInDate = new Date(date);
    const minCheckOut = new Date(checkInDate);
    minCheckOut.setDate(minCheckOut.getDate() + 1);
    
    const checkOutInput = document.getElementById('checkOut');
    if (checkOutInput) {
        checkOutInput.min = minCheckOut.toISOString().split('T')[0];
        
        if (checkOutInput.value && checkOutInput.value <= date) {
            checkOutInput.value = '';
            appState.checkOutDate = null;
        }
    }
    
    const summaryCheckIn = document.getElementById('summaryCheckIn');
    if (summaryCheckIn) summaryCheckIn.textContent = formatDate(date);
    
    calculateTotalPrice();
}

function handleCheckOutChange(date) {
    appState.checkOutDate = date;
    
    const summaryCheckOut = document.getElementById('summaryCheckOut');
    if (summaryCheckOut) summaryCheckOut.textContent = formatDate(date);
    
    calculateTotalPrice();
}

function calculateNights() {
    if (!appState.checkInDate || !appState.checkOutDate) return 0;
    
    const checkIn = new Date(appState.checkInDate);
    const checkOut = new Date(appState.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
}

// ==================== MÉTODO DE PAGO ====================

function selectPaymentMethod(method, clickedElement) {
    appState.paymentMethod = method;
    
    document.querySelectorAll('.payment-method-card').forEach(card => {
        card.classList.remove('active');
    });
    
    if (clickedElement) {
        clickedElement.classList.add('active');
    }
    
    const paymentMethodInput = document.getElementById('paymentMethod');
    if (paymentMethodInput) {
        paymentMethodInput.value = method;
    }
    
    const methodNames = {
        'credit-card': 'Tarjeta de Crédito',
        'debit-card': 'Tarjeta de Débito',
        'pse': 'PSE',
        'nequi': 'Nequi'
    };
    
    console.log('✅ Método de pago seleccionado:', methodNames[method] || method);
    
    if (clickedElement) {
        clickedElement.style.transform = 'scale(0.95)';
        setTimeout(() => {
            clickedElement.style.transform = '';
        }, 150);
    }
}

// ==================== CÁLCULO DE PRECIOS ====================

function calculateTotalPrice() {
    const nights = calculateNights();
    
    const summaryNights = document.getElementById('summaryNights');
    if (summaryNights) summaryNights.textContent = nights;
    
    if (!appState.selectedDestination || nights === 0) {
        resetPriceDisplay();
        return;
    }
    
    const basePrice = appState.selectedDestination.price;
    const subtotal = basePrice * nights;
    const serviceFee = subtotal * pricingConfig.serviceFeePercentage;
    const tax = subtotal * pricingConfig.taxPercentage;
    const total = subtotal + serviceFee + tax;
    
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryServiceFee = document.getElementById('summaryServiceFee');
    const summaryTax = document.getElementById('summaryTax');
    const totalAmount = document.getElementById('totalAmount');
    
    if (summarySubtotal) summarySubtotal.textContent = `${formatCurrency(subtotal)} COP`;
    if (summaryServiceFee) summaryServiceFee.textContent = `${formatCurrency(serviceFee)} COP`;
    if (summaryTax) summaryTax.textContent = `${formatCurrency(tax)} COP`;
    if (totalAmount) totalAmount.textContent = `${formatCurrency(total)} COP`;
}

function resetPriceDisplay() {
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryServiceFee = document.getElementById('summaryServiceFee');
    const summaryTax = document.getElementById('summaryTax');
    const totalAmount = document.getElementById('totalAmount');
    
    if (summarySubtotal) summarySubtotal.textContent = '$0 COP';
    if (summaryServiceFee) summaryServiceFee.textContent = '$0 COP';
    if (summaryTax) summaryTax.textContent = '$0 COP';
    if (totalAmount) totalAmount.textContent = '$0 COP';
}

// ==================== VALIDACIÓN COMPLETA DEL FORMULARIO ====================

function validateForm() {
    const errors = [];
    
    if (!appState.selectedServiceType) {
        errors.push('Selecciona un tipo de servicio');
    }
    
    if (!appState.selectedDestination) {
        errors.push('Selecciona un destino');
    }
    
    if (!appState.checkInDate || !appState.checkOutDate) {
        errors.push('Completa las fechas de entrada y salida');
    }
    
    if (calculateNights() < pricingConfig.minNights) {
        errors.push('La reserva debe ser de al menos 1 noche');
    }
    
    if (!appState.numPeople) {
        errors.push('Selecciona el número de personas');
    }
    
    const fullName = document.getElementById('fullName');
    if (fullName && !validateName(fullName, true)) {
        errors.push('El nombre del titular es inválido');
    }
    
    const email = document.getElementById('email');
    if (email && !validateEmail(email, true)) {
        errors.push('El correo electrónico es inválido');
    }
    
    const phone = document.getElementById('phone');
    if (phone && !validatePhone(phone, true)) {
        errors.push('El teléfono debe tener exactamente 10 dígitos');
    }
    
    const docType = document.getElementById('documentType');
    const docNumber = document.getElementById('documentNumber');
    
    if (docType && !docType.value) {
        errors.push('Selecciona el tipo de documento');
    }
    
    if (docNumber && (!docNumber.value.trim() || docNumber.value.length < 6)) {
        errors.push('Ingresa un número de documento válido');
    }
    
    const companionErrors = validateCompanions();
    errors.push(...companionErrors);
    
    const emergencyContact = document.getElementById('emergencyContact');
    if (emergencyContact && !validateName(emergencyContact, true)) {
        errors.push('El nombre del contacto de emergencia es inválido');
    }
    
    const emergencyPhone = document.getElementById('emergencyPhone');
    if (emergencyPhone && !validatePhone(emergencyPhone, true)) {
        errors.push('El teléfono de emergencia debe tener 10 dígitos');
    }
    
    if (!appState.paymentMethod) {
        errors.push('Selecciona un método de pago');
    }
    
    const acceptTerms = document.getElementById('acceptTerms');
    if (acceptTerms && !acceptTerms.checked) {
        errors.push('Debes aceptar los términos y condiciones');
    }
    
    const acceptCancellation = document.getElementById('acceptCancellation');
    if (acceptCancellation && !acceptCancellation.checked) {
        errors.push('Debes aceptar las políticas de cancelación');
    }
    
    return errors;
}

function validateCompanions() {
    const errors = [];
    const numericValue = appState.numPeople === '6+' ? 6 : parseInt(appState.numPeople || 0);
    const numCompanions = numericValue - 1;
    
    if (numCompanions <= 0) return errors;
    
    for (let i = 1; i <= numCompanions; i++) {
        const nameInput = document.getElementById(`companion-name-${i}`);
        const docTypeSelect = document.getElementById(`companion-doctype-${i}`);
        const docNumInput = document.getElementById(`companion-docnum-${i}`);
        
        if (!nameInput || !docTypeSelect || !docNumInput) {
            errors.push(`Faltan datos del acompañante #${i}`);
            continue;
        }
        
        if (!validateName(nameInput, true)) {
            errors.push(`Nombre inválido del acompañante #${i}`);
        }
        
        if (!docTypeSelect.value) {
            errors.push(`Selecciona tipo de documento del acompañante #${i}`);
        }
        
        if (!docNumInput.value || docNumInput.value.length < 6) {
            errors.push(`Número de documento inválido del acompañante #${i}`);
        }
    }
    
    return errors;
}

// ==================== ENVÍO DEL FORMULARIO ====================

function handleFormSubmit(e) {
    e.preventDefault();
    
    // ✅ PRIMERO: Verificar autenticación ANTES de validar
    const isAuthenticated = typeof authAPI !== 'undefined' && authAPI.isAuthenticated();
    
    if (!isAuthenticated) {
        console.log('⚠️ Usuario no autenticado - Mostrando modal');
        if (typeof showAuthModal === 'function') {
            showAuthModal();
        } else {
            console.error('❌ Función showAuthModal no encontrada');
        }
        return;
    }
    
    // ✅ Solo llega aquí si SÍ está autenticado
    console.log('✅ Usuario autenticado - Validando formulario');
    
    const errors = validateForm();
    
    if (errors.length > 0) {
        showErrors(errors);
        return;
    }
    
    const reservationData = collectFormData();
    saveReservation(reservationData);
    showConfirmationModal(reservationData);
    
    console.log('✅ Reserva enviada:', reservationData);
}

function collectFormData() {
    const nights = calculateNights();
    const basePrice = appState.selectedDestination.price;
    const subtotal = basePrice * nights;
    const serviceFee = subtotal * pricingConfig.serviceFeePercentage;
    const tax = subtotal * pricingConfig.taxPercentage;
    const total = subtotal + serviceFee + tax;
    
    const companions = [];
    const numericValue = appState.numPeople === '6+' ? 6 : parseInt(appState.numPeople || 0);
    const numCompanions = numericValue - 1;
    
    for (let i = 1; i <= numCompanions; i++) {
        const nameInput = document.getElementById(`companion-name-${i}`);
        const docTypeSelect = document.getElementById(`companion-doctype-${i}`);
        const docNumInput = document.getElementById(`companion-docnum-${i}`);
        
        if (nameInput && docTypeSelect && docNumInput) {
            companions.push({
                name: nameInput.value.trim(),
                documentType: docTypeSelect.value,
                documentNumber: docNumInput.value.trim()
            });
        }
    }
    
    const fullName = document.getElementById('fullName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const docType = document.getElementById('documentType');
    const docNumber = document.getElementById('documentNumber');
    const comments = document.getElementById('comments');
    const emergencyContact = document.getElementById('emergencyContact');
    const emergencyPhone = document.getElementById('emergencyPhone');
    const acceptNewsletter = document.getElementById('acceptNewsletter');
    
    return {
        bookingCode: generateBookingCode(),
        timestamp: new Date().toISOString(),
        serviceType: appState.selectedServiceType,
        destination: appState.selectedDestination,
        checkIn: appState.checkInDate,
        checkOut: appState.checkOutDate,
        nights: nights,
        numPeople: appState.numPeople,
        personalInfo: {
            fullName: fullName ? fullName.value.trim() : '',
            email: email ? email.value.trim() : '',
            phone: phone ? phone.value.trim() : '',
            documentType: docType ? docType.value : '',
            documentNumber: docNumber ? docNumber.value.trim() : '',
            comments: comments ? comments.value.trim() : ''
        },
        companions: companions,
        emergencyContact: {
            name: emergencyContact ? emergencyContact.value.trim() : '',
            phone: emergencyPhone ? emergencyPhone.value.trim() : ''
        },
        paymentMethod: appState.paymentMethod,
        pricing: {
            basePrice,
            subtotal,
            serviceFee,
            tax,
            total
        },
        newsletter: acceptNewsletter ? acceptNewsletter.checked : false,
        status: 'pending'
    };
}

function generateBookingCode() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000;
    return `GV-${year}-${random}`;
}

function saveReservation(reservationData) {
    try {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        reservations.push(reservationData);
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        localStorage.setItem('lastReservation', JSON.stringify(reservationData));
        
        console.log('✅ Reserva guardada en localStorage:', reservationData.bookingCode);
        
        try {
            const channel = new BroadcastChannel('gigante-viajero-notifications');
            channel.postMessage({
                type: 'NEW_RESERVATION',
                data: reservationData,
                timestamp: Date.now()
            });
            channel.close();
            console.log('📡 Notificación enviada al dashboard vía BroadcastChannel');
        } catch (bcError) {
            console.log('⚠️ BroadcastChannel no disponible, usando fallback');
            
            const triggerKey = 'reservation-trigger-' + Date.now();
            localStorage.setItem(triggerKey, JSON.stringify({
                bookingCode: reservationData.bookingCode,
                timestamp: Date.now()
            }));
            
            setTimeout(() => {
                localStorage.removeItem(triggerKey);
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error al guardar reserva:', error);
    }
}

function showConfirmationModal(reservationData) {
    const modal = document.getElementById('confirmModal');
    const bookingCodeElement = document.getElementById('bookingCode');
    
    if (bookingCodeElement) {
        bookingCodeElement.textContent = reservationData.bookingCode;
    }
    
    if (modal) {
        modal.classList.add('active');
    }
    
    console.log('📧 Email de confirmación enviado a:', reservationData.personalInfo.email);
}

function showErrors(errors) {
    const errorMessage = errors.join('\n• ');
    alert(`⚠️ Por favor corrige los siguientes errores:\n\n• ${errorMessage}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO').format(Math.round(amount));
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return date.toLocaleDateString('es-CO', options);
}

function resetDestinationPreview() {
    const previewImage = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const previewLocation = document.getElementById('previewLocation');
    
    if (previewImage) previewImage.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop';
    if (previewName) previewName.textContent = 'Selecciona un destino';
    if (previewLocation) previewLocation.textContent = 'Gigante, Huila';
    
    resetPriceDisplay();
}

console.log('🚀 Sistema de Reservas Gigante Viajero - LISTO');