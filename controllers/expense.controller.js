const Expense =require('../models/mysql/expense.model');
const Group = require('../models/mysql/group.model')
const {calculateShares} = require('../utils/splitLogic');
const NotificationService = require('../utils/notification.service');


//add expense

const addExpense = async (req,res)=>{
    try{

        const {groupId,description,amount,splitType,customShares}= req.body;

        if(!groupId || !description || !amount)
        {
            return res.status(400).json({
                success:false,
                message:'GroupId , description and amount are required '
            });
        }

        //group exists

        const group =await Group.findById(groupId);

        if(!group)
        {
            return res.status(404).json({
                success:false,
                message:'Group not found'
            });
        }

        //user is member

        const isMember= await Group.isMember(groupId,req.user.id);

        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message: 'You are not a member of this group'
            });
        }

        //get all group members

        const members = await Group.getMembers(groupId);

        //calculate shares

        const type = splitType || 'equal';
        const shares = calculateShares(
            parseFloat(amount),
            members,
            type,
            customShares || []
        );

        //save expense

        const expenseId =await Expense.create(
            groupId,
            req.user.id,
            description,
            amount,
            type
        );

        //save each share

        for(const share of shares)
        {
            await Expense.addShare(expenseId,share.userId,share.shareAmount);
        }

        //log activity
         await NotificationService.logActivity(
      groupId,
      req.user.id,
      'EXPENSE_ADDED',
      `${req.user.name} added "${description}" ₹${amount}`,
      { expenseId, amount, description }
    );

    // Notify all members except the one who paid
    const memberIds = members
      .map(m => m.id)
      .filter(id => id !== req.user.id);

      
    await NotificationService.sendNotification(
      memberIds,
      groupId,
      `${req.user.name} added "${description}" ₹${amount} — your share: ₹${shares.find(s => s.userId !== req.user.id)?.shareAmount}`,
      'EXPENSE_ADDED'
    );

        //response with split details

        res.status(201).json({
            success:true,
            message:'Expense added successfully',
            expense:{
                id:expenseId,
                groupId,
                description,
                amount,
                splitType:type,
                paidBy: req.user.name,
                shares:shares.map(s=> ({ userId:s.userId , shareAmount:s.shareAmount}))
            }
        });
    }
   catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//group expenses

const getGroupExpenses = async(req,res)=>{
    try{

        const {groupId}= req.params;

        //membership

        const isMember =await Group.isMember(groupId,req.user.id);
        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message:'You are not a member of this group'
            });
        }

        const expenses =await Expense.findByGroupId(groupId);

        //calculate Total 

        const total = expenses.reduce((sum, e)=>sum + parseFloat(e.amount),0);

        res.status(200).json({
            success:true,
            count: expenses.length,
            totalSpent : total.toFixed(2),
            expenses
        });
    }
    catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//single expense detail

const getExpenseDetail = async(req,res)=>{
    try{

        const expense = await Expense.findById(req.params.id);

        if(!expense)
        {
            return req.status(404).json({
                success:false,
                message:'Expense not found'
            });
        }

        //shares with member names

        const shares = await Expense.getShares(req.params.id);

        res.status(200).json({
            success:true,
            expense:{...expense,shares}
        });
    }
    catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

//delete expense

const deleteExpense = async(req,res)=>{
    try{

        const expense =await Expense.findById(req.params.id);

        if(!expense){
            return res.status(404).json({
                success:false,
                message:'Expense not found'
            });
        }

        //only person who piad delete

        if(expense.paid_by !=req.user.id)
        {
            return res.status(403).json({
                success:false,
                message:'Only the person who paid can delete this expense'
            });
        }

        await Expense.delete(req.params.id);

        res.status(200).json({
            success:true,
            message:'Expense deleted successfully'
        });
    }
    catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports={addExpense,getExpenseDetail,getGroupExpenses,deleteExpense};