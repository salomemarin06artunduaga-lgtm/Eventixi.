// MAIN.JS - FUNCIONALIDADES BÁSICAS (LIMPIO)
console.log('main.js cargado');

document.addEventListener('DOMContentLoaded', function() {
    
    // VARIABLES GLOBALES SOLO PARA UI
    let isMenuOpen = false;
    
    // ELEMENTOS DOM
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    // FUNCIÓN 1: MENÚ MÓVIL
    function toggleMobileMenu() {
        isMenuOpen = !isMenuOpen;
        
        if (isMenuOpen) {
            mobileMenu.classList.remove('hidden');
            console.log('Menú abierto');
        } else {
            mobileMenu.classList.add('hidden');
            console.log('Menú cerrado');
        }
    }
    
    // FUNCIÓN 2: MOSTRAR NOTIFICACIÓN
    function showNotification(message) {
        // Crear elemento notificación
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10B981;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 3000);
    }
    
    // EVENT LISTENERS
    
    // Menú móvil
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
        console.log('Event listener menú móvil agregado');
    }
    
    console.log('main.js inicializado correctamente');
});
// LÓGICA DE CARRITO PARA BOTONES
document.querySelectorAll('.add-to-cart-btn').forEach(button => {
    button.addEventListener('click', function() {
        const product = {
            id: this.dataset.id || this.dataset.product.toLowerCase().replace(/\s+/g, '-'),
            name: this.dataset.product,
            price: parseInt(this.dataset.price),
            image: this.dataset.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600'
        };
        
        // Efecto visual
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'scale(1.05)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        }, 150);
        
        // Agregar al carrito
        if (window.addToCart) {
            window.addToCart(product);
        } else {
            console.warn('Sistema de carrito no disponible');
        }
    });
});

// Categorías clickeables
document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
        const category = this.dataset.category;
        console.log(`Navegando a categoría: ${category}`);
        window.location.href = 'productos.html';
    });
});