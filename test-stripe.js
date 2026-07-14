require('dotenv').config({path: '.env.local'});
const { extractContext } = require('./src/lib/engine.ts');

async function run() {
  try {
    const res = await extractContext('https://stripe.com');
    console.log(res);
  } catch (e) {
    console.error(e.message);
  }
}
run();
