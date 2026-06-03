require("dotenv").config();

// Add polyfills for browser APIs used by pdf-parse
  global.DOMMatrix = class DOMMatrix {
    constructor() {}
  };

const app = require("./src/app");
const connectToDB = require("./src/config/database");


connectToDB();





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Health‑check endpoint
app.get('/', (req, res) => res.send('Backend Running'));
