// ----- interfaces para la Lambda -----
export interface LambdaResponse {
    statusCode: number;
    body: string;
    errorMessage?: string;
}