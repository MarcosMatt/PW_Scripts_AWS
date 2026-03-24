import { test, expect } from "@playwright/test";
import { sendMessageToSQS } from "../Utils/LambdaInvoker";
import { SQSMessage } from "../Utils/InterfacesTypes";

// Teste para validar la respuesta de SQS - Adaptado a SQS y con interface
test('Enviar mensaje valido a la cola SQS', async ( ) => {
    
    const city = 'Monterrey';

    const message: SQSMessage = ({ city });

    const messageId = await sendMessageToSQS(message);

    expect(messageId).toBeDefined();
    
    console.log('✅ Mensaje enviado con ID', messageId);
})
