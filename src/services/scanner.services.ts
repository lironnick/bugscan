import chalk from 'chalk';

import { scannerJs } from '@/lib/scanner';
import { createFile } from '@/utils/file';
import { showProgress } from '@/utils/process';
import { FilteredRequestData, JSReader } from '@/lib/scan';

type FinderJsProps = {
  url: string;
  filter?: string;
};

type FinderUrlProps = {
  url: string;
};

export async function finderJs({ url, filter }: FinderJsProps) {
  const jsResult = await scannerJs({ url, filter });

  if (jsResult && jsResult.links.length > 0) {
    await createFile({ data: jsResult.links, nameFile: 'scan_js' });

    console.log(chalk.green(`[SUCCESS] Files ${jsResult.links.length}`));
    return jsResult.links;
  } else {
    console.log(chalk.yellow('[INFO] No links found or scan returned no result.'));
    return [];
  }
}

export async function finderUrl({ url }: FinderUrlProps): Promise<FilteredRequestData[]> {
  const reader = new JSReader();

  const content = await reader.readJS(url, {
    timeout: 15000, // 15 segundos
    maxSize: 1 * 1024 * 1024 * 1024, // 1GB máximo
    useCache: true, // Usar cache
    headers: {
      Authorization: 'Bearer token123',
    },
  });

  // Análise detalhada
  const analysis = reader.quickAnalysis(content);
  console.log('📊 Análise:', analysis);

  // Procurar todas as ocorrências de .post() e extrair o conteúdo dentro dos parênteses
  const regexList = [
    { name: 'POST', regex: /\.post\s*\(([^)]*)\)/g },
    { name: 'GET', regex: /\.get\s*\(([^)]*)\)/g },
    { name: 'PUT', regex: /\.put\s*\(([^)]*)\)/g },
    { name: 'DELETE', regex: /\.delete\s*\(([^)]*)\)/g },
    { name: 'OPTION', regex: /\.option\s*\(([^)]*)\)/g },
  ];

  const allLinks: any[] = [];
  let processedUrls = 0;
  let totalMatches = 0;

  // Count total matches for progress
  for (const { regex } of regexList) {
    totalMatches += [...content.matchAll(regex)].length;
  }

  for (const { name, regex } of regexList) {
    const matches = [...content.matchAll(regex)];
    console.log(chalk.blue(`[INFO] Quantidade de .${name.toLowerCase()} encontrados: ${matches.length}`));

    for (const match of matches) {
      console.log(`${name}: `, match[1].trim());
      const filter = await reader.filterRequestDataAdvanced(match[1].trim(), url, name);

      if (filter && filter.url) {
        allLinks.push(filter);
      }

      processedUrls++;
      showProgress({ current: processedUrls, total: totalMatches, title: `Scraping ${name} JS` });
    }
  }

  return allLinks;
}
