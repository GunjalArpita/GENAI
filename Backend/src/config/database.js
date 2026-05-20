const mongoose = require("mongoose");

async function connectToDB() {
   try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" Connected to database successfully");
    
    // Get the users collection and drop problematic indexes
    try {
        const db = mongoose.connection.db;
        console.log("Checking and fixing indexes...");
        
        // Drop all indexes except _id
        await db.collection('users').dropIndexes();
        console.log("Dropped all indexes");
        
        // Recreate correct indexes from schema
        await db.collection('users').createIndex({ username: 1 }, { unique: true });
        await db.collection('users').createIndex({ email: 1 }, { unique: true });
        console.log(" Created correct indexes");
        
    } catch(indexError) {
        if (indexError.code !== 26) { // 26 = namespace does not exist
            console.warn("Index management note:", indexError.message);
        }
    }
    
   } catch(err) {
    console.error(" Database connection error:", err.message);
    process.exit(1);
   }
};

module.exports = connectToDB;
