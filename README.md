# rr-categories

# Requisitos

- node: > 18
- docker
- serverless
- mongo

# Como configurar para executar os testes localmente

1. Dentro de `package.json.scripts` estão os scripts necessários para inicializar a infraestrutura local

```sh
yarn infra:up
```

2. Para realizar o deploy local, utilizando serverless:

```sh
yarn deploy:local
```

3. Configure AWS CLI para utilizar o localstack:

```sh
aws configure set aws_access_key_id test
aws configure set aws_secret_access_key test
aws configure set default.region us-east-1
```

Agora será possível obter o ID da api pelo API Gateway configurado, utilizando o comando:
```sh
aws apigateway get-rest-apis --endpoint-url=http://localhost:4566
```

Com o `id` retornado, substitua o valor nas requisições para o endpoint local. A documentação dos endpoints pode ser vista no arquivo `categories-collection.json`.

4. Caso tenha interesse em configurar o SECRETS_MANAGER, deve ser executado o seguinte comando para que o localstack armazene o segredo:

```sh
aws --endpoint-url=http://localhost:4566 secretsmanager create-secret \
    --name /local/secure/path/mongo_uri \
    --secret-string '{"MONGO_URI":"mongodb://root:semsenha@localhost:27017/mongo_database"}'

```

# Testes Locais

Após a infraestrutura estar de pé:
A pasta `./scripts/.` contém scripts para realizar os testes das funcionalidades implementadas em ambiente local.

# Estrutura de Categoria

Cada categoria possui os seguintes atributos:

- `id`: Identificador único da categoria.
- `name`: Nome da categoria.
- `description`: Descrição da categoria.
- `enabled`: Indica se a categoria está ativa.
- `parentId`: Identificador da categoria pai.
- `children`: Subcategorias pertencentes a esta categoria.
- `depth`: Profundidade da categoria na hierarquia.
- `pathCategory`: Caminho materializado da categoria.
