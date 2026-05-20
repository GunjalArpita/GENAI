const mongoose = require('mongoose');

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: [true, "Token is required"],
    }
}, {
    timestamps: true
});

const tokenBlacklistModel = mongoose.model("blacklisttokens", blacklistTokenSchema);

module.exports = tokenBlacklistModel;

//in mongodb compass - blacklisttoken collection will be created automatically when we add a token to blacklist
//but the collection is not created.
//from postman i had send post request to delete the user,and user deleted successfully but token is not added to blacklist and collection is not created in mongodb compass.
//  so i am not able to test the logout functionality.
//solution for this kind of issue is-
//1. check if the connection to mongodb is established successfully in app.js file
//2. check if the token is being sent in the request body from postman
//3. check if the token is being received in the logoutUserController function
//4. check if the token is being added to blacklist successfully in the logoutUserController function