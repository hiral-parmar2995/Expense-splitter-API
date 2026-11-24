const {pool} = require ('../../config/db.mysql')

const User = {

    //create new user

    create: async(name,email,hashedpassword)=>{
        const [result] = await pool.execute(
            'INSERT INTO users (name,email,password) VALUES(?, ?, ?)',
            [name,email,hashedpassword]
        );
        return result.insertId;
    },

    //find user by email

    findByEmail: async(email)=>{
        const [rows] =await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        )
        return rows[0];
    },


    //find user by id

    findById : async(id)=>{
        const [rows] =await pool.execute(
            'SELECT id,name,email,created_at FROM users WHERE id=?',
            [id]
        )
        return rows[0];
    }
};

module.exports=User;