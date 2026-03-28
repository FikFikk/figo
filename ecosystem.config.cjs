require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "figo",
      script: "./.output/server/index.mjs",
      env: {
        PORT: 5000,
        RAPIDAPI_KEY: process.env.RAPIDAPI_KEY
      }
    }
  ]
}
