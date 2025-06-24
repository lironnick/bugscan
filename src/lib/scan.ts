import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

import { extractUrl, extractJson } from '@/utils/url';
import chalk from 'chalk';

// Interfaces para tipagem
interface ReadOptions {
  useCache?: boolean;
  timeout?: number;
  maxSize?: number;
  headers?: Record<string, string>;
}

interface ReadResult {
  url: string;
  content?: string;
  error?: string;
  success: boolean;
}

interface MultipleReadResult {
  successful: Record<string, string>;
  failed: Record<string, string>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

interface ModuleSystem {
  esModules: boolean;
  commonjs: boolean;
  amd: boolean;
  umd: boolean;
}

interface CodePatterns {
  functions: number;
  arrowFunctions: number;
  classes: number;
  asyncFunctions: number;
  promises: number;
  eventListeners: number;
}

interface QuickAnalysis {
  size: string;
  sizeBytes: number;
  lines: number;
  nonEmptyLines: number;
  avgLineLength: number;
  minified: boolean;
  hasModules: ModuleSystem;
  frameworks: string[];
  patterns: CodePatterns;
}

interface CacheStats {
  entries: number;
  totalSize: string;
  urls: string[];
}

interface ReadJSResult {
  content?: string;
  analysis?: QuickAnalysis;
  error?: string;
  success: boolean;
}

interface FilteredRequestData {
  baseUrl: string;
  method: string;
  url: string;
  params: Record<string, unknown>;
  headers: Record<string, unknown>;
  config: {
    credentials?: string;
  };
}

class JSReader {
  private cache: Map<string, string>;

  constructor() {
    this.cache = new Map<string, string>();
  }

  /**
   * Lê um arquivo JavaScript diretamente da URL (apenas em memória)
   */
  async readJS(url: string, options: ReadOptions = {}): Promise<string> {
    const {
      useCache = true,
      timeout = 10000,
      maxSize = 10 * 1024 * 1024, // 10MB
      headers = {},
    } = options;

    // Verificar cache
    if (useCache && this.cache.has(url)) {
      console.log(`📋 Usando cache para: ${url}`);
      return this.cache.get(url)!;
    }

    return new Promise<string>((resolve, reject) => {
      const parsedUrl = new URL(url);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      console.log(chalk.blue(`[INFO] Lendo: ${url}`));

      const requestOptions: http.RequestOptions = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/javascript, text/javascript, */*',
          ...headers,
        },
      };

      const request = protocol.get(url, requestOptions, (response) => {
        // Seguir redirecionamentos
        if (response.statusCode === 301 || response.statusCode === 302) {
          const location = response.headers.location;
          if (location) {
            return this.readJS(location, options).then(resolve).catch(reject);
          }
        }

        if (response.statusCode !== 200) {
          reject(new Error(`❌ Erro HTTP: ${response.statusCode} - ${response.statusMessage}`));
          return;
        }

        let data = '';
        let totalSize = 0;

        response.setEncoding('utf8');

        response.on('data', (chunk: string) => {
          totalSize += Buffer.byteLength(chunk, 'utf8');

          // Verificar tamanho máximo
          if (totalSize > maxSize) {
            request.destroy();
            reject(new Error(`❌ Arquivo muito grande: ${totalSize} bytes (limite: ${maxSize})`));
            return;
          }

          data += chunk;
        });

        response.on('end', () => {
          console.log(`✅ Leitura concluída: ${this.formatBytes(totalSize)}`);

          // Armazenar em cache se solicitado
          if (useCache) {
            this.cache.set(url, data);
          }

          resolve(data);
        });
      });

      request.on('error', (error: Error) => {
        reject(new Error(`❌ Erro na requisição: ${error.message}`));
      });

      request.setTimeout(timeout, () => {
        request.destroy();
        reject(new Error(`❌ Timeout após ${timeout}ms`));
      });
    });
  }

  /**
   * Lê múltiplos arquivos JS simultaneamente
   */
  async readMultipleJS(urls: string[], options: ReadOptions = {}): Promise<MultipleReadResult> {
    console.log(`📚 Lendo ${urls.length} arquivos simultaneamente...`);

    const promises = urls.map(async (url: string): Promise<ReadResult> => {
      try {
        const content = await this.readJS(url, options);
        return { url, content, success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        return { url, error: errorMessage, success: false };
      }
    });

    const results = await Promise.all(promises);

    const output: MultipleReadResult = {
      successful: {},
      failed: {},
      summary: {
        total: urls.length,
        successful: 0,
        failed: 0,
      },
    };

    results.forEach((result) => {
      if (result.success && result.content) {
        output.successful[result.url] = result.content;
        output.summary.successful++;
      } else if (result.error) {
        output.failed[result.url] = result.error;
        output.summary.failed++;
      }
    });

    console.log(`📊 Resumo: ${output.summary.successful} sucessos, ${output.summary.failed} falhas`);
    return output;
  }

  /**
   * Análise rápida do código JavaScript
   */
  quickAnalysis(jsContent: string): QuickAnalysis {
    const lines = jsContent.split('\n');
    const analysis: QuickAnalysis = {
      size: this.formatBytes(jsContent.length),
      sizeBytes: jsContent.length,
      lines: lines.length,
      nonEmptyLines: lines.filter((line) => line.trim().length > 0).length,
      avgLineLength: Math.round(jsContent.length / lines.length),
      minified: this.isMinified(jsContent),
      hasModules: this.hasModuleSystem(jsContent),
      frameworks: this.detectFrameworks(jsContent),
      patterns: this.detectPatterns(jsContent),
    };

    return analysis;
  }

  /**
   * Detecta se o código está minificado
   */
  private isMinified(code: string): boolean {
    const lines = code.split('\n');
    const avgLineLength = code.length / lines.length;
    const hasLongLines = lines.some((line) => line.length > 500);
    const hasShortVarNames = /\b[a-z]\b/.test(code);

    return avgLineLength > 200 || hasLongLines || hasShortVarNames;
  }

  /**
   * Detecta sistema de módulos
   */
  private hasModuleSystem(code: string): ModuleSystem {
    return {
      esModules: /import\s+.*from|export\s+/.test(code),
      commonjs: /require\s*\(|module\.exports|exports\./.test(code),
      amd: /define\s*\(/.test(code),
      umd: /typeof exports.*typeof module/.test(code),
    };
  }

  /**
   * Detecta frameworks/bibliotecas
   */
  private detectFrameworks(code: string): string[] {
    const frameworks: string[] = [];
    const patterns: Record<string, RegExp> = {
      React: /React\.|createElement|useState|useEffect/,
      Vue: /Vue\.|createApp|ref\(|reactive\(/,
      Angular: /angular\.|@angular|ng-/,
      jQuery: /jQuery|\$\./,
      Lodash: /lodash|_\./,
      Moment: /moment\(/,
      Axios: /axios\./,
      D3: /d3\./,
      'Three.js': /THREE\./,
      Express: /express\(/,
      Webpack: /__webpack_/,
    };

    Object.entries(patterns).forEach(([name, pattern]) => {
      if (pattern.test(code)) {
        frameworks.push(name);
      }
    });

    return frameworks;
  }

  /**
   * Detecta padrões de código
   */
  private detectPatterns(code: string): CodePatterns {
    return {
      functions: (code.match(/function\s+\w+/g) || []).length,
      arrowFunctions: (code.match(/=>\s*{|=>\s*\w/g) || []).length,
      classes: (code.match(/class\s+\w+/g) || []).length,
      asyncFunctions: (code.match(/async\s+function|async\s+\w+/g) || []).length,
      promises: (code.match(/\.then\(|\.catch\(|new Promise/g) || []).length,
      eventListeners: (code.match(/addEventListener|on\w+\s*=/g) || []).length,
    };
  }

  /**
   * Formata bytes para leitura humana
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Limpa o cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache limpo');
  }

  /**
   * Mostra estatísticas do cache
   */
  getCacheStats(): CacheStats {
    const urls = Array.from(this.cache.keys());
    const totalSize = urls.reduce((sum, url) => {
      return sum + this.cache.get(url)!.length;
    }, 0);

    return {
      entries: urls.length,
      totalSize: this.formatBytes(totalSize),
      urls: urls,
    };
  }

  async filterRequestDataAdvanced(input: string, baseUrl: string = '', method: string = ''): Promise<FilteredRequestData> {
    const result: FilteredRequestData = {
      baseUrl,
      method,
      url: '',
      params: {},
      headers: {},
      config: {},
    };

    // Extrair URL
    const urlMatch = extractUrl(input);
    if (urlMatch) {
      result.url = urlMatch;
    }

    const jsonMatch = extractJson(input);
    if (jsonMatch) {
      result.params = jsonMatch[1];
    }

    const headersMatch = extractJson(input, 'headers');
    if (headersMatch) {
      result.headers = headersMatch[1];
    }

    // Extrair credentials
    const credentialsMatch = input.match(/credentials:\s*"([^"]+)"/);
    if (credentialsMatch) {
      result.config.credentials = credentialsMatch[1];
    }

    return result;
  }
}

// Funções de conveniência
export async function readJSFromURL(url: string, options: ReadOptions = {}): Promise<ReadJSResult> {
  const reader = new JSReader();
  try {
    const content = await reader.readJS(url, options);
    const analysis = reader.quickAnalysis(content);

    return {
      content,
      analysis,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return {
      error: errorMessage,
      success: false,
    };
  }
}

// Exportar
export { JSReader };
export type {
  ReadOptions,
  ReadResult,
  MultipleReadResult,
  ModuleSystem,
  CodePatterns,
  QuickAnalysis,
  CacheStats,
  ReadJSResult,
  FilteredRequestData,
};

// Exemplo de uso
// async function example(): Promise<void> {
//   const reader = new JSReader();

//   try {
//     // Exemplo 1: Ler um arquivo JS
//     const url = 'https://app.payfit.com/assets/index.Bn5_kSXI.js';
//     const content = await reader.readJS(url);

//     // Análise rápida
//     const analysis = reader.quickAnalysis(content);
//     console.log('\n🔍 ANÁLISE RÁPIDA:');
//     console.log(`📏 Tamanho: ${analysis.size}`);
//     console.log(`📄 Linhas: ${analysis.lines}`);
//     console.log(`⚡ Minificado: ${analysis.minified ? 'Sim' : 'Não'}`);
//     console.log(`📦 Frameworks detectados: ${analysis.frameworks.join(', ') || 'Nenhum'}`);
//     console.log(`🔧 Funções: ${analysis.patterns.functions}`);
//     console.log(`🏗️ Classes: ${analysis.patterns.classes}`);

//     // Mostrar início do arquivo
//     console.log('\n📋 INÍCIO DO ARQUIVO:');
//     console.log(content.substring(0, 500) + '...');
//   } catch (error) {
//     const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
//     console.error(`❌ Erro: ${errorMessage}`);
//   }
// }
