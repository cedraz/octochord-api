import * as dotenv from 'dotenv';
import { exit } from 'process';
import 'reflect-metadata';

dotenv.config();

async function runValidation() {
  try {
    console.log('🔍 Validando variáveis de ambiente...');
    await import('./env-validation');
    console.log('✅ Todas as variáveis de ambiente são válidas!');

    exit(0);
  } catch (error) {
    console.error('❌ Erro na validação das variáveis de ambiente:');
    console.error(error);
    exit(1);
  }
}

runValidation();
