import { test, expect } from "../fixtures/clima.fixture";
import { CloudWatchEvent } from "../interfaces/cloudwatch.interface";
import { LambdaResponse } from "../interfaces/lambda.interface";
import { ClimaBody } from "../interfaces/dynamo.interface";

test('Verificar los logs de exito en CloudWatch', async ({ lambdaService, cloudwatchService }) => {
    
    test.setTimeout(60000);

    const ciudad = 'Monterrey';

    const lambdaResponse: LambdaResponse = await lambdaService.invokeSQS("Clima", [ ciudad ]);

    expect(lambdaResponse.statusCode).toBe(200);
    expect(lambdaResponse.errorMessage).toBeUndefined();

    const resultados = JSON.parse(lambdaResponse.body).resultados;

    expect(resultados).toBeDefined();
    expect(resultados.length).toBeGreaterThan(0);

    const body: ClimaBody = resultados[0];
    expect(body.error).toBeUndefined();
    expect(body.ciudad).toBeDefined();

    const startTime: number = Date.now() - 60000;
    const events: CloudWatchEvent[] = await cloudwatchService.getCloudWatchLogs(ciudad, startTime);

    expect(events.length).toBeGreaterThan(0);

    console.log(`✅ Logs encontrados para la ciudad: ${ciudad}`, events);

})
