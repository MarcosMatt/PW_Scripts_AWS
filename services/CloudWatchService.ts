import { CloudWatchLogsClient, FilterLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { CloudWatchEvent } from "../interfaces/cloudwatch.interface";
import { BaseService } from "./BaseService";

export class CloudWatchService extends BaseService {

    private readonly client: CloudWatchLogsClient;
    private readonly logGroupName: string;

    constructor () {
        super();
        this.client = this.createClient();
        this.logGroupName = this.validateEnvVar("AWS_LOG_GROUP");
    }

    private createClient(): CloudWatchLogsClient {
        return new CloudWatchLogsClient({
            region: this.validateEnvVar("AWS_REGION")
        });
    }

    // Helper para consulta de CloudWatch
    async getCloudWatchLogs(
        ciudad: string, 
        startTime: number, 
        retries: number = 10, 
        delayMs: number = 3000): Promise<CloudWatchEvent[]> {
    
        for (let i = 0; i < retries; i++) {
    
            const command = new FilterLogEventsCommand({
                logGroupName: this.logGroupName,
                filterPattern: `"✅ Guardado en DynamoDB:" ${ciudad}`,
                startTime,
            });
    
            const response = await this.client.send(command);
            const events = response.events as CloudWatchEvent[] || [];
    
            if (events.length > 0) {
                console.log(`✅ Logs encontrados en intento ${i + 1}`);
                return events;
            }
    
            console.log(`⏳ Intento ${ i + 1 }/${retries} - Logs aún no disponibles, esperando ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        console.log(`⚠️ No se encontraron logs para ${ciudad} despues de ${retries} intentos`);
        return [];
    }
}