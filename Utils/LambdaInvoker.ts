import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
import { DynamoDBClient, DescribeTableCommand, TableDescription } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { LambdaResponse, ClimaBody, ClimaItem, SQSMessage } from "../Utils/InterfacesTypes";
import { config } from "dotenv";

config();

//Configuramos las variables a usar
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(client);
const tableName = process.env.TABLE_NAME || "city";
const lambdaClient = new LambdaClient({region: process.env.AWS_REGION });
const sqsCliente = new SQSClient({ region: process.env.AWS_REGION });

// Se crea la const con la funcionalidad de validar el estado de la lambda - adaptado a la respuesta de SQS y con interface
export const invokeLambda = async (funcionName: string, payload: object): Promise<LambdaResponse> => {

    const command = new InvokeCommand({
        FunctionName: funcionName,
        Payload: Buffer.from(JSON.stringify(payload)),
        InvocationType: "RequestResponse",
    });

    try {
        
        const response = await lambdaClient.send(command);
        const result: LambdaResponse = JSON.parse(Buffer.from(response.Payload as Uint8Array).toString());

        if (result.errorMessage) {
            throw new Error(`Lambda Error: ${result.errorMessage}`);
        }

        return result;

    } catch (error) {
        console.error("Error al invocar la lambda", error)
        throw error;
    }
}

// Helper para que la lambda responda con lo configurado en SQS
export const invokeLambdaSQS = async (functionName: string, cities: string[]): Promise<LambdaResponse> => {
    
    const sqsPayload = {
        Records: cities.map(city => ({body: JSON.stringify({city})}))
    }

    return invokeLambda(functionName, sqsPayload);
}

// Se crea el const con la funcionalidad de guardar información en la tabla de Dynamo - Sin SQS pero ya con interface
export const saveClimaToDynamo = async (body: ClimaBody): Promise<void> => {

    if (!body.ciudad || !body.temperatura || !body.estado_del_cielo) {
        throw new Error(`Body incompleto: ${JSON.stringify(body)}`);
    }

    await dynamoDb.send( new PutCommand({
        TableName: tableName,
        Item: {
          Ciudad: body.ciudad,
          Temperatura: parseFloat(body.temperatura),
          timestap: new Date().toISOString(),
          EstadoCielo: body.estado_del_cielo,
        }
      }));
}

// Se crea el const para obtener los registros de la tabla en Dynamo - Sin SQS pero ya con interface
export const getClimaFromDynamo = async (ciudad: string): Promise<ClimaItem | undefined> => {

    const result = await dynamoDb.send( new GetCommand({
        TableName: tableName,
        Key: { Ciudad: ciudad },
        ConsistentRead: true,
      }));
      return result.Item as ClimaItem | undefined;
}

// Se crea el conts para devolver las caracteristicas de una tabla - Sin SQS pero ya con interface
export const TablaInfoSchema = async (tableName: string): Promise<TableDescription | undefined> => {
    
    const result = await client.send( new DescribeTableCommand({
        TableName: tableName,
    }));

    return result.Table;
}

// Helper para consultar y validar la respuesta del SQS
export const sendMessageToSQS = async (message: SQSMessage): Promise<string> => {

    const result = await sqsCliente.send(new SendMessageCommand({
        QueueUrl: process.env.AWS_SQS_URL,
        MessageBody: JSON.stringify(message),
    }));

    if (!result.MessageId) {
        throw new Error('SQS no retornó MessageId');
    }

    console.log('✅ Mensaje enviado a SQS con ID:', result.MessageId);
    return result.MessageId;
}
