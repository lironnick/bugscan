import { program } from 'commander';
import chalk from 'chalk';

import { scan } from './lib/scanner.js';
import { LinkFinder } from './lib/linkfinder.js';
import { filtrarURLs } from './utils/filter.js';
import { showProgress } from './utils/progress.js';

program
  .name('bugscan')
  .description('A command line tool to scan for bugs in websites')
  .version('1.0.0')
  .requiredOption('-i, --input <input>', 'Input: URL, file or directory')
  .option('-f, --filter <filter>', 'Process only URLs with file type ex: .js containing given strings (separated by |)')
  .option('-u, --urls', 'Extract all urls found in files')
  .option('-U, --url <filtro>', 'Process only filtered URLs containing the given strings (separated by ,)')
  .action(async (options) => {
    // console.log({ options });

    try {
      console.log(chalk.blue('[INFO] Processing STEP 1'));

      const result = await scan(options.input, options.filter ?? null);

      if (result && result.links) {
        console.log(chalk.green(`[SUCCESS] Files ${result.links.length}`));

        if (options.urls || options.url) {
          console.log(chalk.blue('[INFO] Processing STEP 2'));

          const allLinks = []; // Declarar fora do loop

          let processedUrls = 0;

          // Agora, processar e mostrar progresso corretamente
          for (const [index, site] of result.links.entries()) {
            const finder = new LinkFinder();
            const content = await finder.downloadContent(site);
            const links = finder.extractLinks(content, '' || site);
            const filters = filtrarURLs(links, options.url);

            // console.log('[EE]: ', filters);

            if (Array.isArray(filters)) {
              allLinks.push(...filters);
            } else if (filters) {
              allLinks.push(filters);
            }

            processedUrls++;
            showProgress(processedUrls, result.links.length, '[ETAPA 2] Scraping URLs');

            console.log(chalk.blue(`[INFO] Analisando: ${site}`));
          }

          console.log(chalk.green.bold('✅ Analysis complete!'));
          console.log(chalk.white(`📁 Processed At: ${new Date().toISOString()}`));
          console.log(chalk.white(`📊 Total de URLs processed: ${processedUrls}`));
          console.log('📁 Filter: ', options);
          console.log('📁 Arquivos processed:', {
            qtd: result.links.length,
            links: result.links,
          });

          console.log('📁 Urls processed:', {
            qtd: result.links.length,
            links: result.links,
          });
        } else {
          console.log(chalk.green.bold('✅ Analysis complete!'));
          console.log(chalk.white(`📁 Processed At: ${new Date().toISOString()}`));
          console.log('📁 Filter: ', options);
          console.log({
            'Arquivos processed:': {
              qtd: result.links.length,
              links: result.links,
            },
          });
        }
      } else {
        console.log(chalk.yellow('[INFO] No links found or scan returned no result.'));
      }

      // console.log(chalk.green.bold(`\n✅ =============== Analysis complete! ===============`));
    } catch (error) {
      console.error(chalk.red('Error during scan:', error));
    }
  })
  .parse();
