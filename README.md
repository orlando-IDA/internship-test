# API de Estados e Cidades

API REST para cadastro de estados e cidades, construída em NestJS com MySQL.

Todas as exclusões são lógicas (soft delete): o registro permanece no banco com `deleted_at` preenchido e some das consultas. Isso preserva histórico e mantém a integridade dos relacionamentos.

---

## Como executar

Você precisa apenas do **Docker Desktop** rodando. Não é necessário instalar Node nem MySQL.

### Subindo tudo em container

```bash
git clone https://github.com/orlando-IDA/internship-test.git
```

```bash
cd internship-test
```

```bash
cp .env.example .env
```

Esse terceiro passo é obrigatório e é o que mais se esquece. Sem ele o docker-compose não tem valores para `${MYSQL_ROOT_PASSWORD}` e `${DB_PORT}`, e o MySQL se recusa a iniciar.

```bash
docker compose up -d
```

O Compose sobe o MySQL, espera o healthcheck confirmar que o banco aceita conexão, e só então inicia a API.

Ao subir, a aplicação executa as migrations pendentes e cria as tabelas. Você não precisa rodar SQL nenhum.

A API abre na porta `http://localhost:3000` e o swagger fica em: **`http://localhost:3000/docs`**.

### Rodando em modo desenvolvimento

Se for mexer no código, deixe apenas o banco em container. Rebuildar a imagem a cada alteração seria insuportável.

```bash
cp .env.example .env
```

```bash
docker compose up -d mysql
```

```bash
npm install
```

```bash
npm run start:dev
```

A aplicação roda na sua máquina com hot reload e conecta no MySQL do container via `localhost:3306`. É por isso que o `.env` traz `DB_HOST=localhost` — quando a API roda em container, o Compose sobrescreve para `DB_HOST=mysql`, já que lá dentro `localhost` seria o próprio container da API.

### Comandos úteis

Parar tudo, preservando os dados:

```bash
docker compose down
```

Parar e **apagar o banco inteiro**, para testar uma subida limpa:

```bash
docker compose down -v
```

Recomendo rodar esse último antes de qualquer entrega. Se o projeto sobe depois de um `down -v`, ele sobe na máquina de qualquer pessoa.

Acessar o banco direto:

```bash
docker compose exec mysql mysql -u estados_user -pestados_pass estados_cidades
```

Ver as migrations aplicadas:

```bash
npm run migration:show
```

### Testando os endpoints

Duas opções. Via swagger em `http://localhost:3000/docs` sem instalar nada.

Se preferir, `docs/Insomnia_test_endpoints.yaml` é uma collection do Insomnia com 27 requisições cobrindo os casos de sucesso e de erro, organizadas em pastas. Importe pelo menu do Insomnia o ambiente com a URL base já vem junto, não é necessário configurar nada.

---

## Tecnologias utilizadas

| Ferramenta | Papel |
|---|---|
| **NestJS 11** | Framework da aplicação |
| **TypeScript 5.9** | Linguagem |
| **TypeORM 1.1** | ORM e controle de migrations |
| **MySQL 8.4 LTS** | Banco de dados |
| **Zod 4 + nestjs-zod** | Validação de entrada e geração dos schemas OpenAPI |
| **@nestjs/swagger** | Documentação interativa |
| **@nestjs/config + dotenv** | Configuração por variáveis de ambiente |
| **Docker + Docker Compose** | Banco e aplicação containerizados |

---

## Estrutura do projeto

```
src/
├── main.ts                      entrypoint, pipe global do Zod e setup do Swagger
├── app.module.ts                módulo raiz: configuração, banco e módulos de domínio
│
├── config/
│   └── data-source.ts           DataSource do TypeORM (usado pela app e pelo CLI)
│
├── database/
│   └── migrations/              schema versionado, executado no boot
│
├── common/
│   └── dto/
│       └── paginated-response.dto.ts    envelope { data, meta }
│
├── states/
│   ├── states.module.ts
│   ├── states.controller.ts     rotas HTTP e tradução para DTO
│   ├── states.service.ts        regras de negócio
│   ├── entities/
│   │   └── state.entity.ts
│   └── dto/
│       ├── create-state.dto.ts
│       ├── update-state.dto.ts
│       └── state-response.dto.ts
│
└── cities/                      mesma estrutura de states
```

Fora do `src/`:

```
database/schema.sql              o schema em SQL puro, comentado — documentação
docs/DER.png                     diagrama entidade-relacionamento
docs/Insomnia_test_endpoints.yaml    collection de testes
docker-compose.yml               MySQL 8.4 e a API
Dockerfile                       build multi-stage da imagem da API
```

A organização é **por feature**, não por camada. Cada domínio carrega seu controller, service, entity e DTOs na mesma pasta. Isso é a convenção do NestJS e existe por um motivo: o módulo é a unidade central do framework, e espalhar os arquivos de um mesmo módulo por cinco diretórios quebraria justamente a coesão que o `@Module` deveria expressar.

Note que não existe uma camada `repository`. No TypeORM, o repositório genérico é injetado direto no service com `@InjectRepository`, e já entrega `find`, `save`, `softDelete` e `restore`. Criar uma interface própria só se justificaria com queries complexas, o que não é o caso aqui.

---

## Decisões técnicas

### 1. Por que escolheu esse framework?

Porque o NestJS é o framework Node mais próximo do que eu já conhecia. A arquitetura dele é declaradamente inspirada no Angular — módulos, injeção de dependência por construtor e decorators — e essa mesma estrutura se aproxima do Spring Boot, que é onde tenho mais experiência.

Isso reduziu a distância entre "saber o que quero fazer" e "saber como fazer". O mapeamento é quase direto:

| Spring Boot | NestJS |
|---|---|
| `@RestController` | `@Controller` |
| `@Service` | `@Injectable` |
| `@Entity` | `@Entity` |
| `jakarta.validation` | Zod |

A diferença que mais exigiu atenção foi a ausência de component scan. No Spring, anotar uma classe basta para o framework encontrá-la. No NestJS não existe varredura: cada provider e controller precisa ser declarado explicitamente no `@Module`, e um provider só fica visível para outro módulo se estiver em `exports`. Esquecer isso gera erro de injeção logo no boot.

### 2. Como organizou o projeto?

Por feature, seguindo a convenção do NestJS, com três camadas de responsabilidade bem separadas:

**Controller** cuida só de HTTP. Recebe a requisição, chama o service e traduz o resultado para o DTO de resposta. Não contém regra de negócio.

**Service** concentra as regras e trabalha com entidades de domínio, não com DTOs. Essa escolha é o que permite o `CitiesService` chamar `statesService.findById()` e receber uma entidade `State` completa para vincular à relação — se o service já devolvesse DTO reduzido, essa reutilização quebraria.

**DTOs** separam o contrato HTTP do modelo de dados. As tabelas carregam `created_at`, `updated_at` e `deleted_at`, mas nenhum desses campos aparece nas respostas: o DTO expõe exatamente `id`, `name` e `uf`, que é o que o enunciado especifica.

A validação de entrada usa Zod em vez do `class-validator` padrão do NestJS. O ganho concreto apareceu no Swagger: os schemas OpenAPI são gerados a partir dos mesmos schemas Zod usados na validação, então as restrições documentadas nunca divergem das aplicadas. Com `class-validator` seria necessário declarar cada regra duas vezes — uma no validador, outra em decorators de documentação — e elas se desencontrariam com o tempo.

O Zod também normaliza a entrada antes de validar: `.trim()` e `.toUpperCase()` fazem `" sp "` chegar no service como `"SP"`, sem nenhum tratamento manual.

### 3. Quais dificuldades encontrou?

**Docker foi de longe a maior.** Nunca tinha configurado um ambiente containerizado do zero. Nos projetos em Spring que fiz até aqui, o banco era um Oracle online — bastava apontar a URL de conexão. Aqui foi necessário entender imagem, container e volume como conceitos distintos.

O detalhe que mais custou foi a inicialização: o MySQL leva cerca de 30 segundos para aceitar conexão na primeira subida, e sem um `healthcheck` a API sobe antes do banco estar pronto e morre na conexão. A combinação de `healthcheck` com `depends_on: condition: service_healthy`.

**A segunda foi a falta de familiaridade com o ecossistema.** Em Spring eu teria terminado esse projeto em uma fração do tempo. Aqui, cada passo exigiu confirmar como a ferramenta esperava ser usada: o TypeORM 1.x removeu a forma de array em `relations` e só aceita objeto; o `nestjs-zod` 5 trocou `patchNestJsSwagger` por `cleanupOpenApiDoc`; o `repository.create()` não toca no banco, apenas instancia — quem persiste é o `save()`.

### 4. O que faria diferente se tivesse mais tempo?

**Testes automatizados.** As regras de negócio são o coração do desafio e hoje estão validadas manualmente, pela collection do Insomnia.

### 5. Como utilizou Inteligência Artificial durante o desenvolvimento?

Usei IA principalmente para compensar a falta de familiaridade com o ecossistema Node. Concretamente: para entender conceitos que eram novos para mim — Docker, migrations e o modelo de módulos do NestJS, para gerar a estrutura inicial dos módulos, e para revisar o código escrito, também foi utilizada para a produção da documentação.

---

## Regras de negócio implementadas

Todas as regras da seção 03 do enunciado estão cobertas:

| Regra | Como |
|---|---|
| Sigla da UF com exatamente 2 caracteres | Schema Zod, com normalização para maiúscula |
| Não permitir duas UFs iguais | Validação no service, considerando apenas registros ativos → **409** |
| Não permitir dois estados com o mesmo nome | Idem → **409** |
| Toda cidade pertence a um estado | `stateId` validado contra um estado ativo → **404** se não existir |
| Não repetir nome de cidade dentro do mesmo estado | Validação filtrando por `stateId` → **409** |
| Permitir mesmo nome em estados diferentes | Consequência direta do filtro por `stateId` |
| Impedir exclusão de estado com cidades | Contagem de cidades ativas antes de excluir → **409** |
| Soft delete | `@DeleteDateColumn` do TypeORM, aplicado às duas entidades |

As validações de duplicidade também rodam no update, não apenas na criação — e ignoram o próprio registro, para que manter os valores atuais não gere conflito falso.

---

## Endpoints

### Estados

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/estados` | Cria um estado |
| `GET` | `/estados` | Lista todos os estados ativos |
| `GET` | `/estados/:uf` | Busca pela sigla (aceita minúsculas) |
| `PUT` | `/estados/:id` | Atualiza (substituição completa) |
| `DELETE` | `/estados/:id` | Exclui logicamente |

### Cidades

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/cidades` | Cria uma cidade vinculada a um estado |
| `GET` | `/cidades` | Lista com filtros e paginação |
| `GET` | `/cidades/:id` | Busca pelo ID |
| `PUT` | `/cidades/:id` | Atualiza (substituição completa) |
| `DELETE` | `/cidades/:id` | Exclui logicamente |

A listagem de cidades aceita `uf`, `name`, `page` e `limit`, todos opcionais e combináveis:

```
GET /cidades?uf=SP&name=camp&page=1&limit=20
```

A resposta vem no formato `{ data, meta }`, onde `meta` traz página, limite, total de registros que casam com o filtro e total de páginas.

A busca por `name` é parcial e **ignora acento e maiúscula**, então `?name=sao` encontra "São Paulo". Isso não vem de tratamento na aplicação: é a collation `utf8mb4_0900_ai_ci` do MySQL, escolhida deliberadamente por atender de graça a um requisito obrigatório.

Estados não têm paginação, ao contrário de cidades. São 27 registros num domínio fechado, enquanto o Brasil tem cerca de 5.570 municípios. Paginar os dois por simetria adicionaria cerimônia onde não há benefício.

---

## Modelagem

O diagrama está em `docs/DER.png` e o schema comentado em `database/schema.sql`.

> O arquivo `schema.sql` é documentação, não é executado. A fonte da verdade do schema são as migrations do TypeORM, que rodam automaticamente no boot e registram o que já foi aplicado na tabela `migrations` — por isso subir a aplicação repetidas vezes não recria nada.

Duas escolhas de modelagem que merecem nota:

**`INT` nas chaves primárias, não `BIGINT`.** O TypeORM devolve colunas `bigint` como *string* em JavaScript, para evitar perda de precisão acima de 2⁵³. Isso faria `id` chegar como `"1"` em vez de `1` no JSON, quebrando comparações silenciosamente — tudo isso em troca de um teto que 5.570 municípios nunca encostariam.

**A coluna `state_id` de `cities` é indexada junto com `name`,** num índice composto `(state_id, name)`. Ele atende a três necessidades simultâneas: a exigência do InnoDB de indexar a coluna de uma foreign key, a checagem de cidade duplicada dentro do estado, e o filtro de cidades por estado.
