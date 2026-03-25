import { test, expect } from '../fixtures/clima.fixture';
import { ClimaBody } from "../interfaces/dynamo.interface";

// Test para validar el correcto funcionamiento de la Lambda mediante su respuesta - Sin SQS ni interface
test('Validar la respuesta de la Lambda Clima', async ({ lambdaService }) => {
  
  const lambdaResponse = await lambdaService.invoke("Clima", {city: "Mexico"});

  expect(lambdaResponse).toBeDefined();
  expect(lambdaResponse.statusCode).toBe(200);
  expect(lambdaResponse.errorMessage).toBeUndefined();
  
  const responseBody = JSON.parse(lambdaResponse.body);

  expect(responseBody.ciudad).toBeDefined();
  expect(responseBody.temperatura).toBeDefined();
  expect(responseBody.estado_del_cielo).toBeDefined();

  expect(responseBody.temperatura).toMatch(/^\d+(\.\d+)?\s°C$/);

  console.log("Respuesta de lambda valida:", responseBody)
});

// Test para consultar una ciudad en la Lambda y registrarlo en una tabla de DynamoDB - Sin SQS ni interface
test('Verificar que la ciudad se ingreso de forma correcta en la tabla', async ({ lambdaService, dynamoService }) => {
  
  const city = "Barcelona";

  const lambdaResponse = await lambdaService.invoke("Clima", { city });

  const body = JSON.parse(lambdaResponse.body);

  await dynamoService.saveClima(body);

  const item = await dynamoService.getClima(body.ciudad);

  expect(item).toBeDefined();
  expect(item!.Ciudad).toBe(body.ciudad);
  expect(item!.Temperatura).toBeGreaterThan(10);
  expect(item!.EstadoCielo).toBeDefined();

  console.log("Registro encontrado en Dynamo", item)
});

// Test de error para ciudades que no existen en la Lambda - Se adapta a la respuesta de SQS
test('Verificar que la ciudad no se ingreso de forma correcta en la tabla', async ({ lambdaService, dynamoService }) => {
  
  const city = "Moscú";

  const lambdaResponse = await lambdaService.invokeSQS("Clima", [ city ]);

  expect(lambdaResponse.statusCode).toBe(200);
  expect(lambdaResponse.errorMessage).toBeUndefined();

  const resultados = JSON.parse(lambdaResponse.body).resultados;
  const body: ClimaBody = resultados[0];

  expect(body.ciudad).toBeUndefined();
  expect(body.temperatura).toBeUndefined();

  const item = await dynamoService.getClima(city);
  expect(item).toBeUndefined();

  console.log("Registro no ingresado en Dynamo", item)
});