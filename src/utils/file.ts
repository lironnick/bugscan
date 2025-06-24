import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

type Props = {
  data: any;
  nameFile: string;
  type?: string;
};

export async function createFile({ data, nameFile = 'filter', type = '.json' }: Props): Promise<void> {
  try {
    const analysisDir = path.resolve(process.cwd(), 'analysis');
    await fs.promises.mkdir(analysisDir, { recursive: true });

    const newNameFile = `${nameFile}_${new Date().toISOString()}${type}`;
    const filePath = path.join(analysisDir, newNameFile);

    const jsonString = JSON.stringify(data, null, 2);
    await fs.promises.writeFile(filePath, jsonString, 'utf8');
    console.log(chalk.blue(`[INFO] Save in file ${filePath}`));
  } catch (error) {
    console.error('Erro ao criar arquivo:', error);
  }
}
