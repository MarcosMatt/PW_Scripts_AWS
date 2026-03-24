import { LambdaClient, InvokeCommand, Lambda } from "@aws-sdk/client-lambda";
import { config } from "dotenv";

config();

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

async function invocarLambda() {
    const functionName = "Clima";
    const payload = JSON.stringify({ key: "value" }); // Reemplaza con los datos que deseas enviar a la función Lambda

    const command = new InvokeCommand({
        FunctionName: functionName,
        Payload: Buffer.from(payload),
        InvocationType: "RequestResponse", // Puedes usar "Event" para invocaciones asíncronas
    });

    try {
        const response = await lambda.send(command);
        const responsePayload = JSON.parse(Buffer.from(response.Payload as Uint8Array).toString());

        console.log("Respuesta de Lambda:", responsePayload);

        if (responsePayload.errorMessage) {
            console.error("Error en la función Lambda:", responsePayload.errorMessage);
        } else {
            console.log("Todo Bien");
        }
    } catch (error) {
        console.log("Error al invocar el lambda, revisa la configuración de AWS", error);
    }
}

invocarLambda();
