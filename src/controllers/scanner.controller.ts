import chalk from 'chalk';

import * as scannerServices from '@/services/scanner.services';

import { showProgress } from '@/utils/process';
import { createFile } from '@/utils/file';

type FinderJsAndUrlProps = {
  url: string;
  filter?: string;
};

export async function filterJsData(url: string) {
  await scannerServices.finderUrl({ url });
}

export async function finderJs(url: string) {
  return await scannerServices.finderJs({ url });
}

export async function finderJsAndUrl({ url, filter }: FinderJsAndUrlProps) {
  const jsResult = await scannerServices.finderJs({ url });

  console.log(chalk.green(`[SUCCESS] Files ${jsResult.length}`));

  const allLinks: any = []; // Declarar fora do loop
  let processedUrls = 0;

  for (const [index, site] of jsResult.entries()) {
    const result = await scannerServices.finderUrl({ url: site });

    allLinks.push(...result);

    processedUrls++;
    showProgress({ current: processedUrls, total: jsResult.length, allLinks: allLinks, title: 'Scraping URLs STEP 2' });

    console.log(chalk.blue(`[INFO] Analisando: ${site}`));
  }

  if (allLinks.length > 0) {
    await createFile({ data: allLinks, nameFile: 'scan_url' });
  }

  console.log(chalk.green.bold('✅ Analysis complete!'));
  console.log(chalk.white(`📁 Processed At: ${new Date().toISOString()}`));
  console.log(chalk.white(`📊 Total de URLs processed: ${processedUrls}`));
  console.log('📁 Filter: ', filter);
  console.log('📁 Arquivos processed:', {
    qtd: jsResult.length,
    links: jsResult,
  });

  console.log('📁 Urls processed:', {
    qtd: allLinks.length,
    links: allLinks,
  });

  console.log(chalk.green.bold('✅ finished'));
}
