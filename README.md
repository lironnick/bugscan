# Bugscan

Bugscan é uma ferramenta para descobrir dados sensíveis de uma `URL`.

## 🚀 Build `TypeScript`

### fazer build

```bash
yarn build
```

Vai aparecer um diretorio `dist` para rodar pelo `javascript` bastar rodar o comando:

```bash
yarn start -i https://example.com/app.js
```

ou

```bash
node dist/index.js -i https://example.com/app.js
```

## 🚀 Uso

### Sintaxe Básica

```bash
node dist/index.js -i <input> [opções]
yarn dev -i <input> [opções]
```

### Exemplos de Uso

#### 1. Buscar somente arquivo JavaScript

```bash
node dist/index.js -i https://example.com/app.js -j
yarn dev -i https://example.com/app.js -j
```

#### 2. Burcar todos os arquivos JavaScript e urls

```bash
node dist/index.js -i https://example.com/app.js -u
yarn dev -i https://example.com/app.js -u
```

<!-- #### 4. Analisar todos os arquivos JavaScript e retorna todas as urls encontrado com filtro

```bash
node dist/index.js -i https://example.com/app.js -U 'app.exemplo.com, api.exemplo.com'
yarn dev -i https://example.com/app.js -U 'app.exemplo.com, api.exemplo.com'
``` -->

## 🔧 Opções

| Opção                 | Descrição                                         |
| --------------------- | ------------------------------------------------- |
| `-i, --input <input>` | **Obrigatório**. Input: URL, arquivo ou diretório |
| `-u, --url`           | Extract all urls found in files                   |
| `-j, --javascript`    | Query only JS                                     |

OBS: os arquivos são salvos no diretorio `./analysis` na raiz do projeto

## 🚀 Prisma

### Migrate Database

```bash
npx prisma migrate dev --name init
```
