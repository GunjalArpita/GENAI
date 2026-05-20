const userModel = require("../models/user.model");
const UserModel = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
/*
    * @name-registerUserController
    * @desc- registering a new user
    * @access-Public
*/

async function registerUserController(req, res) {  
    try {
        console.log("=== REGISTER REQUEST ===");
        console.log("Body:", req.body);
        
        const {username, email, password} = req.body;
        
        // Validate all fields exist
        if (!username || !email || !password) {
            console.log(" Missing fields");
            return res.status(400).json({
                message: "All fields (username, email, password) are required"
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            });
        }

        // Check if user already exists
        console.log("Checking for existing user...");
        const existingUser = await UserModel.findOne({
            $or: [{username}, {email}]
        });

        if (existingUser) {
            console.log(" User already exists");
            return res.status(400).json({
                message: "User already exists with this username or email"
            });
        }

        // Hash password
        console.log("Hashing password...");
        const hash = await bcrypt.hash(password, 10);
        console.log("Password hashed");

        // Create user
        console.log("Creating user document...");
        const user = await UserModel.create({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hash
        });
        console.log(" User created:", user._id);

        // Generate token
        console.log("Generating JWT token...");
        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET environment variable is not set");
        }
        
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );
        console.log("Token generated");

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/'
        });

        console.log("REGISTRATION SUCCESSFUL");
        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch(error) {
        console.error(" REGISTRATION ERROR");
        console.error("Error:", error.message);
        console.error("Code:", error.code);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `This ${field} is already registered`
            });
        }
        
        res.status(500).json({
            message: "Error registering user",
            error: error.message
        });
    }
}


/** 
 * @name-loginUserController
 * @desc- logging in a user,expects email and password in request body
 * @access-Public
  
*/

async function loginUserController(req, res) {
    try {
        const {email, password} = req.body;
        
        // Validate inputs
        if (!email || !password) {
            return res.status(400).json({message:"Email and password are required"});
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is not defined in environment variables");
            return res.status(500).json({message:"Server configuration error"});
        }
        
        const user = await UserModel.findOne({email});

        if(!user)
        {
            return res.status(400).json({message:"Invalid email or password"});
        }
        
        const isPasswordValid= await bcrypt.compare(password, user.password);
        if(!isPasswordValid)
        {
            return res.status(400).json({message:"Invalid email or password"});
        }
        
        const token = jwt.sign(
            {id:user._id,username:user.username},
             process.env.JWT_SECRET,
             {expiresIn:"1d"});

             res.cookie("token", token, {httpOnly: true, secure: false, sameSite: 'lax', path: '/'})
             res.status(200).json({
                message:"User logged in successfully",
                token,
                user:{
                    id:user._id,
                    username:user.username, 
                    email:user.email    
                }
                });
    } catch(error) {
        console.error("Login error full details:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            message: "Error logging in user",
            error: error.message,
            details: error.stack
        });
    }
}

/**
 * 
 * @name-logoutUserController
 * @desc-clear token from cookie to log out user and add token to blacklist
 * @access-public
 */


async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if(token)
    {
        // Add token to blacklist
        await tokenBlacklistModel.create({ token });
    }
    res.clearCookie("token");
    res.status(200).json({message:"User logged out successfully"});
}


/**
 * 
 * name-getMeController
 * @desc-Route for getting the details of logged in user.
 * @access-Private 
 */

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        if(!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.status(200).json({
            message:"User details fetched successfully",
            user:{      
                id:user._id,
                username:user.username,
                email:user.email
            }
        });
    } catch(error) {
        res.status(500).json({
            message: "Error fetching user details",
            error: error.message
        });
    }

}

module.exports = {registerUserController,loginUserController,logoutUserController,getMeController};
