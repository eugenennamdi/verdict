import { extractContext } from './src/lib/engine.js';

async function main() {
  try {
    const data = await extractContext('https://fluid.io');
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

main();
