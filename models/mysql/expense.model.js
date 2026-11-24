const {pool} = require('../../config/db.mysql');


const Expense ={

    create : async (groupId, paidBy,description,amount,splitType)=>{
        const [result] =await pool.execute(
            'INSERT INTO expenses (group_id,paid_by,description,amount,split_type) VALUES (? ,?,?,?,?)',
            [groupId,paidBy,description,amount,splitType]
        );
        return result.insertId;
    }, 

    //add share for each member

    addShare:async(expenseId,userId,shareAmount)=>{
        await pool.execute(
            'INSERT INTO expense_shares (expense_id,user_id,share_amount) VALUES (?,?,?)',
            [expenseId,userId,shareAmount]
        );

    },

    //get all expenses of a group

    findByGroupId:async(groupId)=>{
        const [rows] =await pool.execute(
            'SELECT e.* , u.name as paid_by_name FROM expenses e INNER JOIN users u ON e.paid_by = u.id WHERE e.group_id = ? ORDER BY e.created_at DESC',
            [groupId]
        );
        return rows;
    },

    //get single expense with shares

    findById:async(id)=>{
        const [rows] =await pool.execute(
            'SELECT e.* , u.name as paid_by_name FROM expenses e INNER JOIN users u ON e.paid_by = u.id WHERE e.id=?',
            [id]

        );
        return rows[0];
    },

    //get shares of an expense

    getShares : async(expenseId) =>{
        const [rows] = await pool.execute(
            'SELECT es.*, u.name,u.email FROM expense_shares es INNER JOIN users u ON es.user_id = u.id WHERE es.expense_id= ?',
            [expenseId]
        );
        return rows;
},

//delete expense

delete:async(id)=>{
    await pool.execute(
        'DELETE FROM expenses WHERE id = ?',
        [id]
    );
}

};


module.exports= Expense;