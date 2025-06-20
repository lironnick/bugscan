import chalk from 'chalk';

type Props = {
  current: number;
  total: number;
  title?: string;
  allLinks?: any;
};

export const showProgress = ({ current, total, title = 'Scraping STEP 1', allLinks }: Props): void => {
  const progress = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((progress / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  console.clear(); // Limpa o console para atualização
  console.log(chalk.white.bold(`\n[INFO] Processing ${title}`));
  console.log(`\n[${bar}] ${progress}%`);
  console.log(`\nProcessados: ${current} de ${total}`);
  console.log(allLinks ? `Links encontrados: ${allLinks.size}` : '');
  console.log('\n');
};
