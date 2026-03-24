import { test, expect } from '@playwright/test';
import { getClimaFromDynamo, invokeLambda, invokeLambdaSQS, saveClimaToDynamo } from "../Utils/LambdaInvoker";

// Test para validar el correcto funcionamiento de la Lambda mediante su respuesta - Sin SQS ni interface
test('Validar la respuesta de la Lambda Clima', async () => {
  
  const lambdaResponse = await invokeLambda("Clima", {city: "Mexico"});

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
test('Verificar que la ciudad se ingreso de forma correcta en la tabla', async () => {
  
  const city = "Barcelona";

  const lambdaResponse = await invokeLambda("Clima", { city });

  const body = JSON.parse(lambdaResponse.body);

  await saveClimaToDynamo(body);

  const item = await getClimaFromDynamo(body.ciudad);

  expect(item).toBeDefined();
  expect(item!.Ciudad).toBe(body.ciudad);
  expect(item!.Temperatura).toBeGreaterThan(10);
  expect(item!.EstadoCielo).toBeDefined();

  console.log("Registro encontrado en Dynamo", item)
});

// Test de error para ciudades que no existen en la Lambda - Se adapta a la respuesta de SQS
test('Verificar que la ciudad no se ingreso de forma correcta en la tabla', async () => {
  
  const city = "Moscú";

  const lambdaResponse = await invokeLambdaSQS("Clima", [ city ]);

  expect(lambdaResponse.statusCode).toBe(200);
  expect(lambdaResponse.errorMessage).toBeUndefined();

  const resultados = JSON.parse(lambdaResponse.body).resultados;

  expect(resultados[0].error).toBeDefined();
  expect(resultados[0].ciudad).toBeUndefined();

  const item = await getClimaFromDynamo(city);
  expect(item).toBeUndefined();

  console.log("Registro no ingresado en Dynamo", item)
});