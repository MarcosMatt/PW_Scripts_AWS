import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { LambdaResponse } from "../interfaces/lambda.interface";
import { BaseService } from "./BaseService";

export class LambdaService extends BaseService {

    private readonly client: LambdaClient;

    constructor() {
        super();
        this.client = this.createClient();
    }

    private createClient(): LambdaClient {
        return new LambdaClient({
            region: this.validateEnvVar("AWS_REGION")
        });
    }

    // Helper con la funcionalidad de validar el estado de la lambda - adaptado a la respuesta de SQS y con interface
    async invoke(functionName: string, payload: object): Promise<LambdaResponse> {

        if (!functionName) {
            throw new Error(`❌ FunctionName Requerido para invocar Lambda`);
        }

        const command = new InvokeCommand({
            FunctionName: functionName,
            Payload: Buffer.from(JSON.stringify(payload)),
            InvocationType: "RequestResponse",
        });

        try {
            
            const response = await this.client.send(command);
            const result: LambdaResponse = JSON.parse(Buffer.from(response.Payload as Uint8Array).toString());

            if (result.errorMessage) {
                throw new Error(`Lambda Error: ${result.errorMessage}`);
            }

            return result;

        } catch (error) {
            this.logError(`Error al invocar la lambda: ${error}`)
            throw error;
        }
    }

    // Helper para que la lambda responda con lo configurado en SQS
    async invokeSQS(functionName: string, cities: string[]): Promise<LambdaResponse> {
        
        if (!cities.length) {
            throw new Error(`❌ Se requiere al menos una ciudad para invocar la lambda con SQS`);
        }

        const sqsPayload = {
            Records: cities.map(city => ({body: JSON.stringify({city})}))
        }

        return this.invoke(functionName, sqsPayload);
    }

}