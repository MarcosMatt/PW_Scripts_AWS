import { test, expect } from "../fixtures/clima.fixture";
import { S3ContentType, S3UploadResult } from "../interfaces/s3.interface";
import { readdirSync, readFileSync, existsSync, Dirent } from "fs";
import { join } from "path";

const KEY_PREFIX: string = 'reports/latest';

test('Subir reporte HTML a S3', async ( { s3Service } ) => {
    
    test.setTimeout(30000);

    const reportDir: string = process.env.REPORT_DIR!;
    const resultDir: string = process.env.REPORT_RESULT_DIR!;
    const indexPath: string = join(reportDir, 'index.html');

    // Validar si existe el reporte en el directorio
    if (!existsSync(indexPath)) {
        throw new Error(`No se encontro el archivo index.html en el directorio de reportes en: ${indexPath}`);
    }

    // Subir index.html al S3
    const indexContent: Buffer = readFileSync(indexPath);
    const indexResult: S3UploadResult = await s3Service.uploadToS3(
        `${KEY_PREFIX}/index.html`,
        indexContent,
        'text/html' as S3ContentType,
    );

    expect(indexResult.key).toBeDefined();
    console.log(`✅ index.html subido:`, indexResult.key);

    // Subir archivos de resultados de tests en paralelo al S3
    if (existsSync(resultDir)) {

        const files: Dirent[] = readdirSync(resultDir, { withFileTypes: true });
        const jsonFiles: Dirent[] = files.filter((file: Dirent) => file.isFile());

        const uploadResults: S3UploadResult[] = await Promise.all(
            jsonFiles.map(async (file: Dirent): Promise <S3UploadResult> => {
                const filePath: string = join(resultDir, file.name);
                const fileContent: Buffer = readFileSync(filePath);

                return s3Service.uploadToS3(
                    `${KEY_PREFIX}/test-results/${file.name}`,
                    fileContent,
                    'application/json' as S3ContentType,
                );
            })
        )

        // Validar que todos los archivos se subieron
        uploadResults.forEach((result: S3UploadResult) => {
            expect(result.key).toBeDefined();
            console.log(`✅ Resultado subido:`, result.key);
        }); 
    }

    // Verificar que existe el archivo index.html en el S3
    const uploadContent: string = await s3Service.getFromS3(`${KEY_PREFIX}/index.html`);

    expect(uploadContent).toBeDefined();
    expect(uploadContent.length).toBeGreaterThan(0);

    console.log(`✅ Reporte verificado en S3 correctamente`);

});

test('Validar que se haya subido el reporte al S3', async ( { s3Service } ) => {
    
    const indexkey: string = `${KEY_PREFIX}/index.html`;

    console.log(`🔍 Verificando archivo index.html en S3`);

    const uploadContent: string = await s3Service.getFromS3(indexkey);

    expect(uploadContent).toBeDefined();
    expect(uploadContent.length).toBeGreaterThan(0);
    expect(uploadContent).toContain('<html');

    console.log(`✅ Reporte verificado en S3 correctamente`);
})

