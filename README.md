# Bugscan

Bugscan é uma ferramenta para descobrir dados sensíveis de uma `URL`.

## 🚀 Uso

### Sintaxe Básica

```bash
node index.js -i <input> [opções]
```

### Exemplos de Uso

#### 1. Analisar arquivo JavaScript online

```bash
node index.js -i https://example.com/app.js -o results.html
```

#### 2. Analisar arquivo JavaScript online com filtro por tipo de arquivo

```bash
node index.js -i https://example.com/app.js -f 'js, css, html'
```

#### 3. Analisar todos os arquivos JavaScript e retorna todas as urls encontrado

```bash
node index.js -i https://example.com/app.js -u
```

#### 4. Analisar todos os arquivos JavaScript e retorna todas as urls encontrado com filtro

```bash
node index.js -i https://example.com/app.js -U 'app.exemplo.com, api.exemplo.com'
```

## 🔧 Opções

| Opção                   | Descrição                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------- |
| `-i, --input <input>`   | **Obrigatório**. Input: URL, arquivo ou diretório                                   |
| `-f, --filter <filter>` | Process only URLs with file type ex: .js containing given strings (separated by , ) |
| `-u, --url`             | Extract all urls found in files                                                     |
| `-U, --urls <urls>`     | Process only filtered URLs containing the given strings (separated by ,)            |
