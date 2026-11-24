const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({

    userId:{
        type:Number,
        required:true
    },
    groupId:{
         type:Number,
        required:true
    },
    message:{
         type:String,
        required:true
    },
    type:{
        type:String,
        enum:[
            'EXPENSE_ADDED',
            'PAYMENT_MADE',
            'MEMBER_JOINED',
            'GROUP_CREATED'
        ],
        required:true
    },
    isRead:{

        type:Boolean,
        default:false
    },
    createdAt:{
       type:Date,
       default:Date.now 
    }
});

module.exports=mongoose.model('Notification',notificationSchema)