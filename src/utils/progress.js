import chalk from 'chalk';

export const showProgress = (current, total, title = 'Scraping') => {
  const progress = Math.round((current / total) * 100);
  const barLength = 30;
  const filledLength = Math.round((progress / 100) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);

  console.clear(); // Limpa o console para atualização
  console.log(`\n=== Progresso do ${title} ===`);
  console.log(`[${bar}] ${progress}%`);
  console.log(`Processados: ${current} de ${total}`);
  console.log('===========================\n');
};
