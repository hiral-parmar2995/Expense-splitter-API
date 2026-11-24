const Settlement = require('../models/mysql/settlement.model')
const Group = require('../models/mysql/group.model')
const {calculateSettlements} = require('../utils/settlementEngine')
const NotificationService = require('../utils/notification.service');

//get settlement - who pays whom

const getSettlement = async(req,res) =>{
    try{
        const {groupId} = req.params;

        //check membership

        const isMember = await Group.isMember(groupId,req.user.id);
        if(!isMember)
        {
            return res.status(403).json({
                success : false,
                message : 'You are not a member of this group'
            });
        }

        const balances = await Settlement.getBalances(groupId);

        const settlements = calculateSettlements(balances);

        const summary = balances.map(b =>({
            userId : b.userId,
            name:b.name,
            totalPaid: parseFloat(b.totalPaid).toFixed(2),
            totalOwed: parseFloat(b.totalOwed).toFixed(2),
            netBalance : (parseFloat(b.totalPaid) - parseFloat(b.totalOwed)).toFixed(2)
        }));

        res.status(200).json({
            success:true,
            summary,
            settlements : settlements.length > 0
            ? settlements
            : [{ message : 'All Settled Up !'}]
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:'server error',
            error : error.message
        });
    }
};

//settle up - mark payment as done 

const settleUp = async (req,res)=>{
    try{
        const {groupId} = req.params;
        const {receiverId , amount } = req.body;

        if(!receiverId || !amount)
        {
            return res.status(400).json({
                success:false,
                message:'receiverId and amount are required'
            });
        }

        //check membership

        const isMember = await Group.isMember(groupId,req.user.id);
        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message:'You are not member of this group'
            });
        }

        //record settlement
        const settlementId = await Settlement.create(
            groupId,req.user.id,receiverId,amount
        );

        //log activity
        await NotificationService.logActivity(
      groupId,
      req.user.id,
      'PAYMENT_MADE',
      `${req.user.name} paid ₹${amount}`,
      { settlementId, amount, receiverId }
    );

    //notify receiver
    await NotificationService.sendNotification(
      [receiverId],
      groupId,
      `${req.user.name} paid you ₹${amount} 🎉`,
      'PAYMENT_MADE'
    );

        res.status(201).json({
            success:true,
            message:'Payment recorded successfully',
            settlement :{
                id : settlementId,
                groupId,
                payerId:req.user.id,
                receiverId,amount
            }
        });
    }
    catch(error)
    {
         res.status(500).json({
            success:false,
            message:'server error',
            error : error.message
        });
    }
};

//get history -past payments

const getHistory = async(req,res)=>{
    try{
        const { groupId} = req.params;

        const isMember = await Group.isMember(groupId,req.user.id);
        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message:'You are not a member of this group'
            });
        }

        const history = await Settlement.getHistory(groupId);

        res.status(200).json({
            success:true,
            count : history.length,
            history
        });
    }
    catch(error)
    {
          res.status(500).json({
            success:false,
            message:'server error',
            error : error.message
        });
    }
};

module.exports = { getSettlement , settleUp, getHistory};
