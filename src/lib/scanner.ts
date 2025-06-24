import urlParser from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';
import chalk from 'chalk';

import { showProgress } from '@/utils/process';

type ScanResult = {
  url_base: string;
  tipo: string;
  total_links_encontrados: number;
  links: string[];
};

export async function scannerJs({ url, filter }: { url: string; filter?: string | null }): Promise<ScanResult> {
  if (!url) throw new Error('URL é obrigatória');

  const visitedUrls = new Set<string>();
  const urlsToVisit: string[] = [url];
  const allLinks = new Set<string>();
  const baseUrl = new URL(url);

  const isSourceCode = filter
    ? filter.split('|').some((ext) => url.match(new RegExp(`\\.${ext}$`, 'i')))
    : url.match(/\.(js|css|html|ts|jsx|tsx|mjs|json)$/i);

  let totalUrls = 1;
  let processedUrls = 0;

  while (urlsToVisit.length > 0) {
    const currentUrl = urlsToVisit.pop();
    if (!currentUrl) continue;

    if (visitedUrls.has(currentUrl)) {
      processedUrls++;
      //   showProgress(processedUrls, totalUrls, currentUrl);
      showProgress({ current: processedUrls, total: totalUrls, allLinks });
      continue;
    }

    try {
      console.log(chalk.blue(`[INFO] Analisando: ${currentUrl}`));
      const response = await axios.get(currentUrl, {
        timeout: 10000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      visitedUrls.add(currentUrl);
      processedUrls++;

      if (isSourceCode) {
        const content: string = response.data;

        const urlRegex = /(https?:\/\/[^\s"']+)/g;
        const matches = content.match(urlRegex);

        if (matches) {
          matches.forEach((match) => {
            try {
              const parsedUrl = new URL(match);
              if (parsedUrl.hostname === baseUrl.hostname) {
                allLinks.add(match);
                if (!visitedUrls.has(match) && !urlsToVisit.includes(match)) {
                  urlsToVisit.push(match);
                  totalUrls++;
                }
              }
            } catch {
              // Ignore invalid URLs
            }
          });
        }

        const importRegex = /(?:import|require)\s*\(?['"]([^'"]+)['"]\)?/g;
        let importMatch: RegExpExecArray | null;
        while ((importMatch = importRegex.exec(content)) !== null) {
          const importPath = importMatch[1];
          try {
            const absoluteUrl = urlParser.resolve(currentUrl, importPath);
            const parsedUrl = new URL(absoluteUrl);
            if (parsedUrl.hostname === baseUrl.hostname) {
              allLinks.add(absoluteUrl);
              if (!visitedUrls.has(absoluteUrl) && !urlsToVisit.includes(absoluteUrl)) {
                urlsToVisit.push(absoluteUrl);
                totalUrls++;
              }
            }
          } catch {
            // Ignore invalid imports
          }
        }
      } else {
        const $ = cheerio.load(response.data);
        $('a').each((_, link) => {
          const href = $(link).attr('href');
          if (href) {
            try {
              const absoluteUrl = urlParser.resolve(currentUrl, href);
              const parsedUrl = new URL(absoluteUrl);
              if (parsedUrl.hostname === baseUrl.hostname) {
                allLinks.add(absoluteUrl);
                if (!visitedUrls.has(absoluteUrl) && !urlsToVisit.includes(absoluteUrl)) {
                  urlsToVisit.push(absoluteUrl);
                  totalUrls++;
                }
              }
            } catch {
              // Ignore invalid hrefs
            }
          }
        });
      }

      //   showProgress(processedUrls, totalUrls, currentUrl);
      showProgress({ current: processedUrls, total: totalUrls, allLinks });
    } catch (error: any) {
      console.error(`Erro ao acessar ${currentUrl}:`, error.message);
      processedUrls++;
      //   showProgress(processedUrls, totalUrls, currentUrl);
      showProgress({ current: processedUrls, total: totalUrls, allLinks });
    }
  }

  console.log('\n=== Scraping Concluído ===');
  console.log(`Total de URLs processadas: ${processedUrls}`);
  console.log(`Total de links únicos encontrados: ${allLinks.size}`);
  console.log('===========================\n');

  return {
    url_base: url,
    tipo: isSourceCode ? 'código fonte' : 'página web',
    total_links_encontrados: allLinks.size,
    links: Array.from(allLinks),
  };
}
