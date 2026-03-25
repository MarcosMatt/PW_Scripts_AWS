// ----- interfaces para DynamoDB ----
export interface ClimaBody {
    ciudad: string;
    temperatura: string;
    estado_del_cielo: string;
    error?: string;
}
 
export interface ClimaItem {
    Ciudad: string;
    Temperatura: number;
    EstadoCielo: string;
    timestap: string;
}