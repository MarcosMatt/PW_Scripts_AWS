import { DynamoDBClient, DescribeTableCommand, TableDescription } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ClimaBody, ClimaItem } from "../interfaces/dynamo.interface";
import { BaseService } from "./BaseService";

export class DynamoService extends BaseService {

    private readonly client: DynamoDBClient;
    private readonly dynamoDb: DynamoDBDocumentClient;
    private readonly tableName: string;

    constructor(){
        super();
        this.client = this.createClient();
        this.dynamoDb = this.createDocClient();
        this.tableName = this.resolveTableName();
    }

    private createClient(): DynamoDBClient {
        return new DynamoDBClient({
            region: this.validateEnvVar("AWS_REGION")
        });
    }

    private createDocClient(): DynamoDBDocumentClient{
        return DynamoDBDocumentClient.from(this.client);
    }

    private resolveTableName(): string {
        return process.env.TABLE_NAME || "city";
    }

    // Helper con la funcionalidad de guardar información en la tabla de Dynamo - Sin SQS pero ya con interface
    async saveClima(body: ClimaBody): Promise<void> {
    
        if (!body.ciudad || !body.temperatura || !body.estado_del_cielo) {
            throw new Error(`Body incompleto: ${JSON.stringify(body)}`);
        }
    
        await this.dynamoDb.send( new PutCommand({
            TableName: this.tableName,
            Item: {
              Ciudad: body.ciudad,
              Temperatura: parseFloat(body.temperatura),
              timestap: new Date().toISOString(),
              EstadoCielo: body.estado_del_cielo,
            }
          }));

          this.log(`✅ Guardado en DynamoDB: ${body.ciudad}`);
    }

    // Helper para obtener los registros de la tabla en Dynamo - Sin SQS pero ya con interface
    async getClima(ciudad: string): Promise<ClimaItem | undefined> {
    
        if (!ciudad) {
            throw new Error(`❌ Ciudad Requerida para consultar DynamoDB`);
        }

        const result = await this.dynamoDb.send( new GetCommand({
            TableName: this.tableName,
            Key: { Ciudad: ciudad },
            ConsistentRead: true,
          }));
          return result.Item as ClimaItem | undefined;
    }

    // Helper para devolver las caracteristicas de una tabla - Sin SQS pero ya con interface
    async getTableInfo(tableName: string): Promise<TableDescription | undefined> {
        
        if (!tableName) {
            throw new Error(`❌ TableName Requerido para consultar DynamoDB`);
        }

        const result = await this.client.send( new DescribeTableCommand({
            TableName: tableName,
        }));
    
        return result.Table;
    }
}