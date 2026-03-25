import { test, expect } from "../fixtures/clima.fixture";
import { SQSMessage } from "../interfaces/sqs.interface";

// Teste para validar la respuesta de SQS - Adaptado a SQS y con interface
test('Enviar mensaje valido a la cola SQS', async ( { sqsService } ) => {
    
    const message: SQSMessage = { city: 'Monterrey' };

    const messageId: string = await sqsService.sendMessage(message);

    expect(messageId).toBeDefined();
    
    console.log('✅ Mensaje enviado con ID', messageId);
})
