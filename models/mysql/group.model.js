const {pool} = require('../../config/db.mysql');


const Group = {

    //create group

    create: async(name, description,createdBy)=>{
        const[result] = await pool.execute(
            'INSERT INTO groups_table (name,description,created_by) VALUES (?,?,?)',
            [name,description,createdBy]
        );
        return result.insertId;
    },

    //add member to group

    addMember: async(groupId,userId)=>{

        const [result] = await pool.execute(
            'INSERT INTO group_members (group_id,user_id) VALUES (? ,?)',
            [groupId,userId]
        );
        return result.insertId
    },


    //find group by id

    findById : async(id)=>{
        const[rows] =await pool.execute(
            'SELECT * FROM groups_table WHERE id=?',
            [id]
        );
        return rows[0];
    },

    //get all group of a user

    findByUserId : async(userId)=>{
        const [rows]=await pool.execute(
            'SELECT g.* FROM groups_table g INNER JOIN group_members gm ON g.id=gm.group_id WHERE gm.user_id = ? ORDER BY g.created_at DESC',
            [userId]
        );
        return rows[0];
    },

    //get all memeber of a group

    getMembers:async(groupId)=>{
        const[rows]=await pool.execute(
           `SELECT u.id, u.name, u.email, gm.joined_at
       FROM users u
       INNER JOIN group_members gm ON u.id = gm.user_id
       WHERE gm.group_id = ?`, [groupId]
        );
        return rows;
    },
    //check if user is member of group

    isMember:async(groupId,userId)=>{
        const [rows]=await pool.execute(
            'SELECT * FROM group_members WHERE group_id = ? AND user_id=?',
            [groupId,userId]
        );
        return rows.length>0;
    },

    //delete group
    delete:async(id)=>{
        const [rows]=await pool.execute(
            'DELETE FROM groups_table WHERE id=?',
            [id]
        );
        return rows[0];
    }
};

module.exports=Group;