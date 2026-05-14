// =============================================
// VALIDADORES DE RESERVAS - GIGANTE VIAJERO
// =============================================

const { body, validationResult } = require('express-validator');

/**
 * Middleware para validar datos de reserva
 */
const validateBooking = [
    // Validar tipo de servicio
    body('serviceType')
        .notEmpty().withMessage('El tipo de servicio es requerido')
        .isIn(['parque', 'mirador', 'glamping', 'hospedaje'])
        .withMessage('Tipo de servicio inválido'),
    
    // Validar destino
    body('destination.name')
        .notEmpty().withMessage('El nombre del destino es requerido')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('El nombre del destino debe tener entre 3 y 200 caracteres'),
    
    body('destination.location')
        .notEmpty().withMessage('La ubicación del destino es requerida'),
    
    body('destination.price')
        .notEmpty().withMessage('El precio es requerido')
        .isNumeric().withMessage('El precio debe ser un número')
        .custom((value) => value >= 0).withMessage('El precio debe ser positivo'),
    
    // Validar fechas
    body('checkIn')
        .notEmpty().withMessage('La fecha de entrada es requerida')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            const checkIn = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return checkIn >= today;
        }).withMessage('La fecha de entrada debe ser hoy o en el futuro'),
    
    body('checkOut')
        .notEmpty().withMessage('La fecha de salida es requerida')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value, { req }) => {
            const checkIn = new Date(req.body.checkIn);
            const checkOut = new Date(value);
            return checkOut > checkIn;
        }).withMessage('La fecha de salida debe ser posterior a la fecha de entrada'),
    
    // Validar número de personas
    body('numPeople')
        .notEmpty().withMessage('El número de personas es requerido'),
    
    // Validar información personal
    body('personalInfo.fullName')
        .notEmpty().withMessage('El nombre completo es requerido')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres')
        .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
        .withMessage('El nombre solo puede contener letras y espacios'),
    
    body('personalInfo.email')
        .notEmpty().withMessage('El correo electrónico es requerido')
        .isEmail().withMessage('Formato de correo electrónico inválido')
        .normalizeEmail(),
    
    body('personalInfo.phone')
        .notEmpty().withMessage('El teléfono es requerido')
        .matches(/^\d{10}$/)
        .withMessage('El teléfono debe tener exactamente 10 dígitos'),
    
    body('personalInfo.documentType')
        .notEmpty().withMessage('El tipo de documento es requerido')
        .isIn(['CC', 'CE', 'PA', 'TI'])
        .withMessage('Tipo de documento inválido'),
    
    body('personalInfo.documentNumber')
        .notEmpty().withMessage('El número de documento es requerido')
        .trim()
        .isLength({ min: 6, max: 20 })
        .withMessage('El número de documento debe tener entre 6 y 20 caracteres'),
    
    // Validar contacto de emergencia
    body('emergencyContact.name')
        .notEmpty().withMessage('El nombre del contacto de emergencia es requerido')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre del contacto debe tener entre 3 y 100 caracteres')
        .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/)
        .withMessage('El nombre del contacto solo puede contener letras y espacios'),
    
    body('emergencyContact.phone')
        .notEmpty().withMessage('El teléfono de emergencia es requerido')
        .matches(/^\d{10}$/)
        .withMessage('El teléfono de emergencia debe tener exactamente 10 dígitos'),
    
    // Validar método de pago
    body('paymentMethod')
        .notEmpty().withMessage('El método de pago es requerido')
        .isIn(['credit-card', 'debit-card', 'pse', 'nequi'])
        .withMessage('Método de pago inválido'),
    
    // Validar pricing
    body('pricing.total')
        .notEmpty().withMessage('El total es requerido')
        .isNumeric().withMessage('El total debe ser un número')
        .custom((value) => value > 0).withMessage('El total debe ser mayor a 0'),
    
    // Middleware para manejar errores de validación
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => ({
                field: error.path,
                message: error.msg
            }));
            
            return res.status(400).json({
                success: false,
                message: 'Errores de validación',
                errors: errorMessages
            });
        }
        
        next();
    }
];

/**
 * Validador para actualización de estado
 */
const validateStatusUpdate = [
    body('status')
        .notEmpty().withMessage('El estado es requerido')
        .isIn(['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'])
        .withMessage('Estado inválido'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Estado inválido',
                errors: errors.array()
            });
        }
        
        next();
    }
];

/**
 * Validador para cancelación
 */
const validateCancellation = [
    body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('La razón no puede exceder 500 caracteres'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Datos de cancelación inválidos',
                errors: errors.array()
            });
        }
        
        next();
    }
];

module.exports = {
    validateBooking,
    validateStatusUpdate,
    validateCancellation
};