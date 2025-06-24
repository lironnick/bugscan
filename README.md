# Bugscan

Bugscan é uma ferramenta para descobrir dados sensíveis de uma `URL`.

## 🚀 Build

A ferramenta foi desenvolvida em `TypeScript` e para rodar é necessário fazer o build,
ao fazer o build vai aparecer um diretorio `dist` para rodar pelo `javascript`.

### fazer build

```bash
yarn build
```

```bash
yarn start [opções] <url>
```

ou

```bash
node dist/index.js [opções] <url>
```

### SEM build

```bash
yarn dev [opções] <input> [opções]
```

## Uso

### Sintaxe Básica

```bash
node dist/index.js -i <input> [opções]
```

ou

```bash
yarn dev -i <input> [opções]
```

### Exemplos de Uso

#### 1. Buscar somente arquivo JavaScript

```bash
node dist/index.js -i https://example.com/app.js -j
```

ou

```bash
yarn dev -i https://example.com/app.js -j
```

#### 2. Burcar todos os arquivos JavaScript e urls

```bash
node dist/index.js -i https://example.com/app.js -u
```

ou

```bash
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

## Prisma

### Migrate Database

```bash
npx prisma migrate dev --name init
```

### Ver os dados no Database

```bash
npx prisma studio
```
