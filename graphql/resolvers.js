const { Query } = require('mongoose');
const {pool} = require ('../config/db.mysql');
const {calculateSettlements } = require('../utils/settlementEngine');

const resolvers = {
     Query:{

        //group analytics

        groupAnalytics : async(_, {groupId}) => {
            try{

                //1. get group info
                const [groupRows] = await pool.execute(
                    'SELECT * FROM groups_table WHERE id = ?',
                    [groupId]
                );
                const group = groupRows[0];

                if(!group) throw new Error('Group not found');

                // get total members

                const [memberRows]=await pool.execute(
                    'SELECT COUNT(*) as count FROM group_members WHERE group_id = ?',
                    [groupId]
                );
                const totalMembers = memberRows[0].count;

                // get all expenses

                const [expenseRows] =await pool.execute(
                    `SELECT e.* , u.name as paid_by_name FROM expenses e INNER JOIN users u ON e.paid_by = u.id WHERE e.group_id = ? ORDER BY e.created_at DESC`,
                    [groupId]
                );

                //calculate total spent

                const totalSpent = expenseRows.reduce((sum,e)=> sum + parseFloat(e.amount),0);

                //find top spender 

                const spenderMap = {};
                expenseRows.forEach(e =>{
                    if (!spenderMap[e.paid_by]){
                        spenderMap[e.paid_by]={
                            userId: e.paid_by,
                            name : e.paid_by_name,
                            amount : 0
                        }
                    }
                    spenderMap[e.paid_by].amount += parseFloat(e.amount);
                });

                const topSpender = Object.values(spenderMap).sort((a,b) => b.amount - a.amount)[0] || null;

                // expense breakdown

                const expenseBreakdown = expenseRows.map(e =>({
                    id: e.id,
                    description : e.description,
                    amount : parseFloat(e.amount),
                    paidBy : e.paid_by_name,
                    splitType : e.paid_type,
                    date : e.created_at.toISOString().split('T')[0]
                }));

                //member balances

                const [balanceRows] =await pool.execute(
                   `SELECT 
            u.id as userId,
            u.name,
            COALESCE((
              SELECT SUM(e.amount) 
              FROM expenses e 
              WHERE e.paid_by = u.id AND e.group_id = ?
            ), 0) as totalPaid,
            COALESCE((
              SELECT SUM(es.share_amount) 
              FROM expense_shares es
              INNER JOIN expenses e ON es.expense_id = e.id
              WHERE es.user_id = u.id AND e.group_id = ?
            ), 0) as totalOwed
           FROM users u
           INNER JOIN group_members gm ON u.id = gm.user_id
           WHERE gm.group_id = ?
           GROUP BY u.id, u.name`,
          [groupId, groupId, groupId]
        );

        const memberBalances = balanceRows.map(b => ({
          userId: b.userId,
          name: b.name,
          totalPaid: parseFloat(b.totalPaid),
          totalOwed: parseFloat(b.totalOwed),
          netBalance: parseFloat(b.totalPaid) - parseFloat(b.totalOwed)
        }));

        // 8. Settlement suggestions
        const rawSettlements = calculateSettlements(balanceRows);
        const settlements = rawSettlements.map(s => ({
          fromName: s.from.name,
          toName: s.to.name,
          amount: s.amount
        }));

        return {
          groupId: group.id,
          groupName: group.name,
          totalSpent,
          totalMembers,
          topSpender,
          expenseBreakdown,
          memberBalances,
          settlements
        };

      } catch (error) {
        throw new Error(error.message);
      }
    },

    // USER SUMMARY
    userSummary: async (_, { userId }) => {
      try {

        // 1. Get user
        const [userRows] = await pool.execute(
          'SELECT * FROM users WHERE id = ?',
          [userId]
        );
        const user = userRows[0];
        if (!user) throw new Error('User not found');

        // 2. Total groups
        const [groupRows] = await pool.execute(
          'SELECT COUNT(*) as count FROM group_members WHERE user_id = ?',
          [userId]
        );
        const totalGroups = groupRows[0].count;

        // 3. Total paid across all groups
        const [paidRows] = await pool.execute(
          'SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE paid_by = ?',
          [userId]
        );
        const totalPaid = parseFloat(paidRows[0].total);

        // 4. Total owed across all groups
        const [owedRows] = await pool.execute(
          'SELECT COALESCE(SUM(share_amount), 0) as total FROM expense_shares WHERE user_id = ?',
          [userId]
        );
        const totalOwed = parseFloat(owedRows[0].total);

        return {
          userId: user.id,
          name: user.name,
          totalGroups,
          totalPaid,
          totalOwed,
          netBalance: totalPaid - totalOwed
        };

      } catch (error) {
        throw new Error(error.message);
      }
    }

  }
};

module.exports=resolvers;