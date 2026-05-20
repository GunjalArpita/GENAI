const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");


 async function authUser(req, res, next) 
{
    let token = req.cookies.token;
    
    // If no token in cookies, check Authorization header
    if (!token && req.headers.authorization) {
        const authHeader = req.headers.authorization;
        if (authHeader.startsWith('Bearer ')) {
            token = authHeader.slice(7);
        }
    }
    
    if(!token)
    {
        return res.status(401).json({
            message: "Unauthorized: No token provided"
        });
    }

const  isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
if(isTokenBlacklisted)
{
    return res.status(401).json({
        message: "Unauthorized: Token is Invalid"
    });
}

    try
   {
    const decoded = jwt.verify(token,process.env.JWT_SECRET) 
    req.user = decoded;
    next();
   
}
catch(err){
    return res.status(401).json({
        message:"Unauthorized: Invalid token"
    });
}
}

module.exports = {authUser};