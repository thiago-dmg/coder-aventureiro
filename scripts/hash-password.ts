/**
 * Gera um hash bcrypt de uma senha em texto puro.
 * Uso: npm run hash-password -- "minha-senha-forte"
 *
 * Cole o resultado no .env como ADMIN_PASSWORD_HASH.
 */
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('❌ Passe a senha como argumento.');
  console.error('   Ex: npm run hash-password -- "minha-senha"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);

// Escapa os $ pra não serem interpretados pelo dotenv
// como referência a variáveis de ambiente.
const escaped = hash.replace(/\$/g, '\\$');

console.log('\n✅ Hash gerado. Cole no seu .env (já com os $ escapados):\n');
console.log(`ADMIN_PASSWORD_HASH="${escaped}"\n`);
console.log('⚠️  Os \\$ são propositais — não remova. O dotenv interpreta');
console.log('   $ como referência a variável, então precisamos escapar.\n');
