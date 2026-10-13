const bcrypt = require('bcryptjs');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

readline.question('Enter the password to hash: ', (password) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  console.log('\nYour password hash is:');
  console.log(hash);
  console.log('\nCopy this hash and set it as ADMIN_PASSWORD_HASH in your .env or Vercel environment variables.');
  readline.close();
});
