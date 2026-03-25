
export abstract class BaseService {
    
    protected validateEnvVar( name: string ): string {

        const value = process.env[name];

        if (!value) {
            throw new Error(`Variable de entorno requerida no configurada: ${name}`)
        }

        return value;
    }

    protected log(message: string): void {
        console.log(`✅ [${this.constructor.name}] ${message}`);
    }

    protected logError(message: string): void {
        console.error(`❌ [${this.constructor.name}] ${message}`);
    }

    protected logWarn(message: string): void {
        console.warn(`⚠️ [${this.constructor.name}] ${message}`);
    }
}