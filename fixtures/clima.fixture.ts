import { test as base } from "@playwright/test";
import { LambdaService } from "../services/LambdaService";
import { DynamoService } from "../services/DynamoService";
import { SQSService } from "../services/SQSService";
import { S3Service } from "../services/S3Service";
import { CloudWatchService } from "../services/CloudWatchService";
import { config } from "dotenv";

config();

type ServiceFixtures = {
    lambdaService: LambdaService;
    dynamoService: DynamoService;
    sqsService: SQSService;
    s3Service: S3Service;
    cloudwatchService: CloudWatchService
};

export const test = base.extend<ServiceFixtures>({

    lambdaService: async ({}, use) => { await use(new LambdaService()); },
    dynamoService: async ({}, use) => { await use(new DynamoService()); },
    sqsService: async ({}, use) => { await use(new SQSService()); },
    s3Service: async ({}, use) => { await use(new S3Service()); },
    cloudwatchService: async ({}, use) => { await use(new CloudWatchService()); },

});

export { expect } from "@playwright/test"