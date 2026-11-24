const NotificationService = require('../utils/notification.service');

//get my notifications

const getMyNotifications = async(req,res) =>{
    try{

        const notifications = await NotificationService.getUserNotifications(req.user.id);
        const unReadCount = await NotificationService.countUnread(req.user.id);

        res.status(200).json({
            success:true,
            unReadCount,
            count:notifications.length,
            notifications
        });

    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message:'Server error',
            error: error.message
        })
    }
}

//get group activity feed
const getGroupActivity = async(req,res)=>{
    try{

        const activities =await NotificationService.getGroupActivity(req.params.groupId);

        res.status(200).json({
            success:true,
            count:activities.length,
            activities
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message: 'Server error',
            error : error.message
        })
    }
}

//mark all as read

const markAllRead = async(req,res)=>{
    try{

        await NotificationService.markAllRead(req.user.id);

        res.status(200).json({
            success:true,
            message : 'All notifications marked as read'
        });
    }
    catch(error)
    {
        res.status(500).json({
            success:false,
            message : 'Server error',
            error : error.message
        })
    }
}

module.exports={getMyNotifications,getGroupActivity,markAllRead};