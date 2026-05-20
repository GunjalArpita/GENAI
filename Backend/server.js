require("dotenv").config();

// Add polyfills for browser APIs used by pdf-parse
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {}
  };
}

const app = require("./src/app");
const connectToDB = require("./src/config/database");


connectToDB();





app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
