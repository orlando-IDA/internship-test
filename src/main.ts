import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ZodValidationPipe, cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('API de Estados e Cidades')
    .setDescription(
      'API REST para gerenciamento de estados e cidades.\n\n' +
        'Nenhuma exclusão apaga dados de verdade. Todas usam soft delete: o ' +
        'registro fica no banco com `deleted_at` preenchido e some das ' +
        'consultas. Isso preserva o histórico e a integridade dos ' +
        'relacionamentos.\n\n' +
        'Como consequência, registros excluídos não bloqueiam recriação — ' +
        'apagar a UF `MG` e criar outra `MG` funciona. As regras de ' +
        'unicidade valem apenas entre registros ativos.\n\n' +
        'Comece por `/estados`: toda cidade precisa de um estado existente ' +
        'para ser criada.',
    )
    .setVersion('1.0.0')
    .addTag('Estados', 'Cadastro de estados (UF única, nome único)')
    .addTag('Cidades', 'Cadastro de cidades, com filtros e paginação')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // cleanupOpenApiDoc pós-processa o documento para que os schemas gerados
  // pelos DTOs do Zod apareçam corretamente. Sem ele, os corpos de requisição
  // saem vazios na documentação.
  SwaggerModule.setup('docs', app, cleanupOpenApiDoc(document));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
