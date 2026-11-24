const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({

    groupId:{
        type:Number,
        required:true
    },
    userId:{
        type:Number,
        required:true
    },
    action:{
        type:String,
        enum:[
            'GROUP_CREATED',
            'MEMBER_JOINED',
            'EXPENSE_ADDED',
            'EXPENSE_DELETED',
            'PYMENT_MADE',
            'GROUP_DELETED'
        ],
        required:true
    },
    message:{
        type:String,
        required:true
    },
    metadata:{
        type:mongoose.Schema.Types.Mixed,
        default:{}
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});

module.exports=mongoose.model('Activity',activitySchema);