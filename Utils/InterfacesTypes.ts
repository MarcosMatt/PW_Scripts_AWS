// ----- interfaces para la Lambda -----
export interface LambdaResponse {
    statusCode: number;
    body: string;
    errorMessage?: string;
}

// ----- interfaces para DynamoDB ----
export interface ClimaBody {
    ciudad: string;
    temperatura: string;
    estado_del_cielo: string;
}
 
export interface ClimaItem {
    Ciudad: string;
    Temperatura: number;
    EstadoCielo: string;
    timestap: string;
}

// ---- interfaces para SQS -------
export interface SQSMessage {
    city: string;
}