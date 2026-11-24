const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/mysql/user.model');


//genrate JWT token

const generateToken = (userId)=>{
    return jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn : process.env.JWT_EXPIRES_IN}
    );
};

//register

const register =async(req,res)=>{

    try{
        const {name,email,password}=req.body;

        //all filed present
        
        if(!name || !email || !password){
            return res.status(400).json({
                success: false,
                message: 'Please Provide name,email and password'
            });
        }

        //if user already exists

        const userExist =await User.findByEmail(email);
        if(userExist) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

       //hash password

       const salt = await bcrypt.genSalt(10);
       const hashedpassword = await bcrypt.hash(password,salt);

       //save to database 

       const userId =await User.create(name,email,hashedpassword);

       // generate token

       const token = generateToken(userId);

       res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user : {id: userId,name,email }
       });
    }
    catch(error)
    {
        res.status(500).json({
            success : false,
            message: 'Server error',
            error: error.message
        });
    }
};


//login

const login =async(req,res)=>{

    try{
        const {email,password} =req.body;

        //check fields

        if(!email || !password)
        {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        //find user

        const user =await User.findByEmail(email);

        if(!user)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        //check password

        const match= await bcrypt.compare(password,user.password);

        if(!match)
        {
            return res.status(400).json({
                success: false,
                message: 'Invalid Email or Password'
            });
        }

        //token

        const token=generateToken(user.id)
    
        res.status(200).json({
            success :true,
            message : 'Login Successful',
            token,
            user:{id : user.id ,name:user.name ,email : user.email}
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message: 'Server Error',
            error:error.message
        });
    }
};

// my profile

const getMe =async (req,res)=>{
    try{
        const user =await User.findById(req.user.id);
        res.status(200).json({
            success:true,
            user
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message: 'Server Error',
            error: error.message
        });
    }
};

module.exports= {register,login,getMe};