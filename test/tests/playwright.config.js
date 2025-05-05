module.exports = {
    // Specify the path to your custom fixtures.js file
    testDir: './tests', // Directory where your tests are located
    // Optional: Setup for the browser (if needed)
    use: {
      baseURL: 'http://borobudur-svc.linkaja.dev:8000', // If you have a common base URL for API requests
    },
    // Other configurations (optional)
  };
  