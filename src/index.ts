import { program } from 'commander';
import chalk from 'chalk';

import { filterJsData, finderJsAndUrl } from '@/controllers/scanner.controller';
import { testRequest } from '@/controllers/testRequest.controller';
import { prisma } from './lib/prisma';

program
  .name('bugscan')
  .description('A command line tool to scan for bugs in websites')
  .version('1.0.0')
  .requiredOption('-i, --input <input>', 'Input: URL, file or directory')
  .option('-u, --urls', 'Extract all urls found in files')
  .option('-j, --javascript', 'Query only JS')
  // .option('-U, --url <filtro>', 'Process only filtered URLs containing the given strings (separated by ,)')
  // .option('-f, --filter <filter>', 'Process only URLs with file type ex: .js containing given strings (separated by |)')
  .option('-t, --test', 'Teste de codigo')
  .action(async (options) => {
    // console.log('Command: ', { options });

    console.log(chalk.green('\n🔍 ANÁLISE:'), options);

    if (options.urls) {
      /* === -u, --urls === */
      await finderJsAndUrl({ url: options.input, filter: options.filter });
      /* ============================ FIM URLS ============================*/
    } else if (options.url) {
      /* === -U, --url <filtro> === */
      /* ============================ FIM URL ============================*/
    } else if (options.javascript) {
      /* === --t --test para teste === */
      await filterJsData(options.input);
      /* ============================ FIM TEST ============================*/
    } else if (options.test) {
      /* === --t --test para teste === */
      await testRequest();
      /* ============================ FIM TEST ============================*/
    } else {
      // const teste = await prisma.found.create({ data: { values: 'ola' } });

      // console.log({ teste });
      console.error(chalk.red(`❌ Error: no command was passed.`));
    }
  })
  .parse();
