// =============================================
// SCRIPT DE PRUEBA - VERIFICAR EMAIL
// =============================================

require('dotenv').config();
const { verifyEmailConfig, sendEmail } = require('./config/nodemailer');

async function testEmailConfiguration() {
    console.log('\n🔍 VERIFICANDO CONFIGURACIÓN DE EMAIL...\n');
    
    // 1. Verificar variables de entorno
    console.log('📋 Variables de Entorno:');
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log(`   EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Configurado' : '❌ NO configurado'}`);
    console.log('');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.log('❌ ERROR: Faltan configurar EMAIL_USER y EMAIL_PASSWORD en el archivo .env\n');
        console.log('📚 Lee README_EMAILS.md para instrucciones de configuración\n');
        process.exit(1);
    }
    
    // 2. Verificar conexión con servidor de email
    console.log('🔌 Verificando conexión con servidor de email...');
    const isConnected = await verifyEmailConfig();
    
    if (!isConnected) {
        console.log('\n❌ NO se pudo conectar al servidor de email');
        console.log('\n💡 Posibles soluciones:');
        console.log('   1. Verifica que hayas generado una "Contraseña de aplicación" en Gmail');
        console.log('   2. NO uses tu contraseña normal de Gmail');
        console.log('   3. Activa la verificación en 2 pasos primero');
        console.log('   4. Ve a: https://myaccount.google.com/apppasswords\n');
        process.exit(1);
    }
    
    // 3. Enviar email de prueba
    console.log('\n📧 Enviando email de prueba...\n');
    
    const testEmail = process.env.EMAIL_USER; // Enviar a ti mismo
    
    const result = await sendEmail({
        to: testEmail,
        subject: '✅ Prueba de Email - Gigante Viajero',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #195C33 0%, #0d3d20 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
                    h1 { margin: 0; font-size: 28px; }
                    .check { font-size: 48px; margin-bottom: 10px; }
                    .content { color: #374151; line-height: 1.6; }
                    .success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="check">✅</div>
                        <h1>¡Email Configurado!</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #195C33;">¡Felicitaciones! 🎉</h2>
                        <p>Tu configuración de email está funcionando perfectamente.</p>
                        
                        <div class="success-box">
                            <strong>✅ Verificaciones Exitosas:</strong>
                            <ul>
                                <li>Conexión con servidor de email</li>
                                <li>Credenciales correctas</li>
                                <li>Envío de emails funcionando</li>
                            </ul>
                        </div>
                        
                        <p><strong>Detalles de Configuración:</strong></p>
                        <ul>
                            <li><strong>Servicio:</strong> Gmail</li>
                            <li><strong>Usuario:</strong> ${process.env.EMAIL_USER}</li>
                            <li><strong>Fecha:</strong> ${new Date().toLocaleString('es-CO')}</li>
                        </ul>
                        
                        <p>Ahora puedes crear reservas y los emails se enviarán automáticamente a tus usuarios.</p>
                        
                        <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
                            <strong>Próximos pasos:</strong><br>
                            1. Inicia tu servidor: <code>npm run dev</code><br>
                            2. Crea una reserva de prueba en Postman<br>
                            3. Verifica que lleguen los emails de confirmación e itinerario
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `
    });
    
    if (result.success) {
        console.log('✅ ¡EMAIL DE PRUEBA ENVIADO EXITOSAMENTE!\n');
        console.log(`   📧 Destinatario: ${testEmail}`);
        console.log(`   📨 Message ID: ${result.messageId}\n`);
        console.log('🎉 ¡Todo está configurado correctamente!');
        console.log('   Revisa tu bandeja de entrada (y spam) para ver el email\n');
        console.log('📚 Siguiente: Lee README_EMAILS.md para instrucciones de uso\n');
    } else {
        console.log('❌ ERROR al enviar email de prueba\n');
        console.log(`   Error: ${result.error}\n`);
        process.exit(1);
    }
}

// Ejecutar prueba
testEmailConfiguration()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ Error durante la prueba:', error.message);
        process.exit(1);
    });