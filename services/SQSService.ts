import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSMessage } from "../interfaces/sqs.interface";
import { BaseService } from "./BaseService";

export class SQSService extends BaseService {
    
    private readonly client: SQSClient;
    private readonly queueURl: string;

    constructor() {
        super();
        this.client = this.createClient();
        this.queueURl = this.validateEnvVar("AWS_SQS_URL");
    }

    private createClient(): SQSClient {
        return new SQSClient({
            region: this.validateEnvVar("AWS_REGION")
        });
    }

    // Helper para consultar y validar la respuesta del SQS
    async sendMessage(message: SQSMessage): Promise<string> {

        if (!this.queueURl) {
            throw new Error(`❌ AWS_SQS_URL no esta configurado en las variables de entorno`);
        }

        if (!message.city) {
            throw new Error(`❌ El mensaje debe contener una ciudad valida`);
        }
    
        const result = await this.client.send(new SendMessageCommand({
            QueueUrl: this.queueURl,
            MessageBody: JSON.stringify(message),
        }));
    
        if (!result.MessageId) {
            throw new Error('SQS no retornó MessageId');
        }
    
        console.log(`✅ Mensaje enviado a SQS con ID: ${result.MessageId}`);
        return result.MessageId;
    }
}