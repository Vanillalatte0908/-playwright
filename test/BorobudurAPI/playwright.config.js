const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
        // Specify the path to your custom fixtures.js file
         testDir: './test/BorobudurAPI', // Directory where your tests are located
        // Optional: Setup for the browser (if needed
        use: {
          headless: false, // 👈 Show the browser
          viewport: { width: 1280, height: 720 },
          // slowMo: 500, // Optional: slow down actions to see them clearly
        }
      });