const jwt =require('jsonwebtoken');
const User = require('../models/mysql/user.model')


const protect =async(req,res,next)=>{
    try{

        // token exists in header

        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer')){
            return res.status(401).json({
                success : false,
                message : 'Not authorized , no token'
            });
        }

        //extract token

        const token = authHeader.split(' ')[1];

        //verify token

        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        //find user from token

        const user = await User.findById(decoded.id);
        if(!user)
        {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        //attach user to request

        req.user=user;
        next();

    }
    catch(error)
    {
        res.status(401).json({
            success: false,
            message: 'Not authorized , invalid token'
        });
    }
};

module.exports={protect};