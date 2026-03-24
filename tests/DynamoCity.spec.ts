import { test, expect } from "@playwright/test";
import { getClimaFromDynamo, invokeLambda, saveClimaToDynamo, TablaInfoSchema } from "../Utils/LambdaInvoker";
import { ClimaBody, ClimaItem } from "../Utils/InterfacesTypes";

// Test para validar el ingreso de un registro en una tabla de DynamoDB sin necesidad de consultar la Lambda - Sin SQS y con interface
test('Verificar escritura directa en DynamoDB', async ( ) => {
    
    const body: ClimaBody = {
        ciudad: "Namek",
        temperatura: "24.2 °C",
        estado_del_cielo: "Despejado"
    }

    await saveClimaToDynamo(body);

    console.log(`✅ Escritura directa correcta para ${body.ciudad}`);

    const item: ClimaItem | undefined =  await getClimaFromDynamo(body.ciudad);

    expect(item).toBeDefined();
    expect(item!.Ciudad).toBe(body.ciudad);
    expect(item!.Temperatura).toBe(24.2);
    expect(item!.EstadoCielo).toBe(body.estado_del_cielo);
    expect(item!.timestap).toBeDefined();

    console.log(`✅ Lectura exitosa para ${body.ciudad}`);
})

// Este test no es necesario ya que el Helper "GetClimaFromDynamo" ya incluye el campo que valida la consistencia implicitamente - Sin SQS y con interface
test('Verificar lectura consistente en DynamoDB', async ( ) => {
    
    const body: ClimaBody = {
        ciudad: "Namek",
        temperatura: "24.2 °C",
        estado_del_cielo: "Despejado"
    }

    await saveClimaToDynamo(body);

    console.log(`✅ Escritura directa correcta para ${body.ciudad}`);

    const item: ClimaItem | undefined =  await getClimaFromDynamo(body.ciudad);

    expect(item).toBeDefined();
    expect(item!.Ciudad).toBe(body.ciudad);
    expect(item!.Temperatura).toBe(24.2);
    expect(item!.EstadoCielo).toBe(body.estado_del_cielo);
    expect(item!.timestap).toBeDefined();

    console.log(`✅ Lectura exitosa para ${body.ciudad}`);
    
})

// Test para verificar las configuraciones y propiedades de una tabla en Dynamo - Sin SQS
test('Verificar configuración de la tabla DynamoDB', async ( ) => {
    
    const NombreTabla = 'city';
    const NombreCampo = 'Ciudad';

    const tableInfo = await TablaInfoSchema(NombreTabla);

    console.log(`📊 Configuración de la tabla: `, JSON.stringify(tableInfo));

    expect(tableInfo).toBeDefined();
    expect(tableInfo?.KeySchema?.length).toBeGreaterThan(0);
    expect(tableInfo?.KeySchema?.[0].AttributeName).toBe(NombreCampo);
    expect(tableInfo?.KeySchema?.[0].KeyType).toBe('HASH');
    expect(tableInfo?.TableStatus).toBe("ACTIVE");

})

// Test para realizar la concurrencia de 10 registros paralelos en una tabla en Dynamo - Sin SQS
test('Simulación de concurrencia: 10 escrituras DynamoDB', async ( ) => {
    
    const ciudades = ['Chicago', 'Knoxville', 'Texas', 'Sinaloa', 'San Diego', 'San Jose', 'Nueva York', 'Toronto', 'Oaxaca City', 'Chihuahua'];

    const items = await Promise.all(
        ciudades.map(async (ciudad) => {
            const respuesta = await invokeLambda("Clima", { city: ciudad });
            expect(respuesta.errorMessage).toBeUndefined();

            const body = JSON.parse(respuesta.body);
            await saveClimaToDynamo(body);

            const item = await getClimaFromDynamo(body.ciudad);
            return item;
        })
    );

    items.forEach((item, indice) => {
        expect.soft(item).toBeDefined();
        expect.soft(item?.Ciudad).toBe(ciudades[indice]);
        expect.soft(item?.Temperatura).toBeGreaterThan(0);
        expect.soft(item?.EstadoCielo).toBeDefined();
        
        console.log(`✅ Registro encontrado para ${ciudades[indice]}`, item);
    })
})