import https from 'https';
import http from 'http';
import { URL } from 'url';

type StatsParams = {
  filters: string[];
};

type RequestDetail = {
  search?: string;
  method: string;
  path: string;
  params: string[];
  data: string | null;
  fullMatch: string;
  type: 'url' | 'endpoint' | 'api';
};

class LinkFinder {
  private patterns: RegExp[];
  private foundLinks: Set<string>;
  private requestDetails: RequestDetail[];

  constructor() {
    this.patterns = [
      /https?:\/\/[^\s"'<>]+/gi,
      /["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /["'`]\/api\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /["'`]\/[a-zA-Z0-9\/_\-\.]*\?[a-zA-Z0-9=&_\-]*["'`]/gi,
      /["'`]\/[a-zA-Z0-9\/_\-\.]*\{[a-zA-Z0-9_]*\}[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /url\s*:\s*["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /\.get\s*\(\s*["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /\.post\s*\(\s*["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /\.put\s*\(\s*["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /\.delete\s*\(\s*["'`]\/[a-zA-Z0-9\/_\-\.]*["'`]/gi,
      /fetch\s*\(\s*["'`][^"'`]*["'`]/gi,
      /\.open\s*\(\s*["'`][^"'`]*["'`]\s*,\s*["'`][^"'`]*["'`]/gi,
      /axios\.(get|post|put|delete|patch)\s*\(\s*["'`][^"'`]*["'`]/gi,
      /\$\.(get|post|ajax)\s*\(\s*["'`][^"'`]*["'`]/gi,
    ];

    this.foundLinks = new Set<string>();
    this.requestDetails = [];
  }

  reset(): void {
    this.foundLinks.clear();
    this.requestDetails = [];
  }

  extractLinks({ content, baseUrl }: { content: string; baseUrl?: string }): RequestDetail[] {
    const details: RequestDetail[] = [];

    this.patterns.forEach((pattern) => {
      const matches = content.match(pattern);

      if (matches) {
        matches.forEach((match) => {
          const detail = this.parseRequestDetail(match, baseUrl);

          if (detail && this.isValidLink(detail.path)) {
            details.push(detail);
            this.foundLinks.add(detail.path);
            this.requestDetails.push(detail);
          }
        });
      }
    });

    return details;
  }

  private parseRequestDetail(match: string, baseUrl?: string): RequestDetail | null {
    let method = 'GET'; // método padrão
    let path = '';
    let params: string[] = [];
    let data: string | null = null;
    const fullMatch = match;

    console.log('[OPOPOPOPOPOP]:', fullMatch);

    // Extrair método HTTP
    if (match.includes('.get(')) method = 'GET';
    else if (match.includes('.post(')) method = 'POST';
    else if (match.includes('.put(')) method = 'PUT';
    else if (match.includes('.delete(')) method = 'DELETE';
    else if (match.includes('.patch(')) method = 'PATCH';
    else if (match.includes('axios.get(')) method = 'GET';
    else if (match.includes('axios.post(')) method = 'POST';
    else if (match.includes('axios.put(')) method = 'PUT';
    else if (match.includes('axios.delete(')) method = 'DELETE';
    else if (match.includes('axios.patch(')) method = 'PATCH';
    else if (match.includes('$.get(')) method = 'GET';
    else if (match.includes('$.post(')) method = 'POST';
    else if (match.includes('fetch(')) {
      // Para fetch, precisaria analisar o segundo parâmetro para determinar o método
      method = 'GET'; // assumindo GET por padrão
    }

    // Limpar e extrair o path
    path = this.cleanLink(match);

    // Extrair parâmetros da query string
    if (path.includes('?')) {
      const [cleanPath, queryString] = path.split('?');
      path = cleanPath;

      if (queryString) {
        params = queryString.split('&').map((param) => {
          const [key, value] = param.split('=');
          return value ? `${key}=${value}` : key;
        });
      }
    }

    // Identificar parâmetros de rota (ex: {id}, :id)
    const routeParams = path.match(/\{[^}]+\}|:[a-zA-Z0-9_]+/g);
    if (routeParams) {
      params.push(...routeParams);
    }

    // Construir URL completa se necessário
    if (baseUrl && path.startsWith('/') && !path.startsWith('//')) {
      try {
        const base = new URL(baseUrl);
        path = `${base.protocol}//${base.host}${path}`;
      } catch (e) {
        // Mantém o path original se não conseguir construir a URL
      }
    }

    // Determinar tipo
    let type: 'url' | 'endpoint' | 'api' = 'endpoint';
    if (path.startsWith('http')) {
      type = 'url';
    } else if (path.includes('/api/')) {
      type = 'api';
    }

    // Tentar extrair dados do corpo da requisição (limitado sem contexto completo)
    if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
      // Aqui seria necessário mais contexto para extrair o corpo da requisição
      // Por enquanto, deixamos como null
      data = null;
    }

    return {
      search: baseUrl,
      method,
      path,
      params,
      data,
      fullMatch,
      type,
    };
  }

  cleanLink(match: string): string {
    let cleanLink = match.replace(/["'`]/g, '').trim();

    cleanLink = cleanLink.replace(
      /^(\.get|\.post|\.put|\.delete|fetch|url\s*:|\.open|axios\.(get|post|put|delete|patch)|\$\.(get|post|ajax))\s*\(\s*/,
      ''
    );
    cleanLink = cleanLink.replace(/\s*,.*$/, '');

    return cleanLink;
  }

  isValidLink(link: string): boolean {
    if (link.length < 2) return false;

    const invalidExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.css', '.ico', '.svg', '.woff', '.woff2', '.ttf', '.webp'];
    if (invalidExtensions.some((ext) => link.toLowerCase().endsWith(ext))) {
      return false;
    }

    if (link.startsWith('#') || link === '/') return false;

    return true;
  }

  async downloadContent(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;

      const request = client.get(
        url,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LinkFinder/1.0)',
          },
          timeout: 10000,
        },
        (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            resolve(data);
          });
        }
      );

      request.on('error', reject);
      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  getStats({ filters }: StatsParams): { total: number; filters: number; urls: number; endpoints: number; api: number } {
    const links = Array.from(this.foundLinks);

    return {
      total: links.length,
      filters: filters.length,
      urls: links.filter((link) => link.startsWith('http')).length,
      endpoints: links.filter((link) => link.startsWith('/')).length,
      api: links.filter((link) => link.includes('/api/')).length,
    };
  }

  getAllLinks(): string[] {
    return Array.from(this.foundLinks).sort();
  }

  // Novo método para obter todos os detalhes das requisições
  getAllRequestDetails(): RequestDetail[] {
    return this.requestDetails;
  }

  // Método para filtrar detalhes por tipo
  getRequestDetailsByType(type: 'url' | 'endpoint' | 'api'): RequestDetail[] {
    return this.requestDetails.filter((detail) => detail.type === type);
  }

  // Método para filtrar detalhes por método HTTP
  getRequestDetailsByMethod(method: string): RequestDetail[] {
    return this.requestDetails.filter((detail) => detail.method.toLowerCase() === method.toLowerCase());
  }
}

export { LinkFinder, RequestDetail };
