const { pool } = require('../../config/db.mysql');

const Settlement = {

  create: async (groupId, payerId, receiverId, amount) => {
    const [result] = await pool.execute(
      'INSERT INTO settlements (group_id, payer_id, receiver_id, amount) VALUES (?, ?, ?, ?)',
      [groupId, payerId, receiverId, amount]
    );
    return result.insertId;
  },

  getBalances: async (groupId) => {
  const [rows] = await pool.execute(
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
  return rows;
},

  getHistory: async (groupId) => {
    const [rows] = await pool.execute(
      `SELECT s.*, 
        p.name as payer_name, 
        r.name as receiver_name
       FROM settlements s
       INNER JOIN users p ON s.payer_id = p.id
       INNER JOIN users r ON s.receiver_id = r.id
       WHERE s.group_id = ?
       ORDER BY s.settled_at DESC`,
      [groupId]
    );
    return rows;
  }

};

module.exports = Settlement;