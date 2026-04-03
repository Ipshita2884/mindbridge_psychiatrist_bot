import fs from 'fs';
import { execSync } from 'child_process';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const log = (msg) => console.log(`\x1b[36m[MindBridge Magic]\x1b[0m ${msg}`);
const warn = (msg) => console.log(`\x1b[33m[Warning]\x1b[0m ${msg}`);

async function setup() {
  console.clear();
  console.log(`
  ******************************************
  *   ✨ WELCOME TO MINDBRIDGE AURA ✨     *
  *      The Magic Recovery Project         *
  ******************************************
  `);

  log("Hi! I'm your AI helper. Let's get things ready for you!");

  // Step 1: Check for Ollama
  try {
     log("Checking for your AI robot (Ollama)...");
     execSync('ollama --version', { stdio: 'ignore' });
     log("✅ Found Ollama! You are awesome!");
     
     const pullModels = await new Promise(res => {
        rl.question("\x1b[36m[MindBridge Magic]\x1b[0m Do you want me to download the magic Brains (AI models) for you now? (yes/no): ", (ans) => res(ans.toLowerCase().startsWith('y')));
     });

     if (pullModels) {
        log("🧠 Downloading phi3 (Clinical Brain)... please wait a moment...");
        execSync('ollama pull phi3', { stdio: 'inherit' });
        log("👁️  Downloading llava (Bio-Vision)... please wait a moment...");
        execSync('ollama pull llava', { stdio: 'inherit' });
        log("✅ All brains downloaded! You're ready!");
     }
  } catch (e) {
     warn("❌ I couldn't find Ollama on your path.");
     log("Don't worry! You can still run the project, but the chat will be in 'Demo Mode'.");
     log("You can download it later at https://ollama.com");
  }

  // Step 2: Ask for Secret Keys (Optional)
  log("\nDo you have any 'Secret Keys' for Supabase? (If not, just press ENTER to use magic mocks)");
  
  const hasKeys = await new Promise(res => {
    rl.question("Do you want to add keys now? (yes/no): ", (ans) => res(ans.toLowerCase().startsWith('y')));
  });

  if (hasKeys) {
    const url = await new Promise(res => rl.question("Paste your Supabase URL: ", res));
    const key = await new Promise(res => rl.question("Paste your Supabase Anon Key: ", res));
    
    const envContent = `SUPABASE_URL=${url}\nSUPABASE_ANON_KEY=${key}\nJWT_SECRET=demo_secret\n`;
    fs.writeFileSync('./backend/.env', envContent);
    log("✅ Keys saved in backend/.env!");
  } else {
    log("✨ Okay! We'll use the 'Magic Mocks'. Everything will still work!");
    if (!fs.existsSync('./backend/.env')) {
        fs.writeFileSync('./backend/.env', "JWT_SECRET=demo_secret\n");
    }
  }

  log("\n🚀 EVERYTHING IS READY!");
  log("To start the whole project with ONE COMMAND, just type:");
  console.log("\n   \x1b[1m\x1b[32mnpm run aura\x1b[0m\n");
  
  log("I'll open the project for you now...");
  rl.close();
  
  try {
    execSync('npm run aura', { stdio: 'inherit' });
  } catch (e) {
    log("Setup finished. You can now run 'npm run aura' yourself!");
  }
}

setup();
