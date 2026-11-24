const Group = require('../models/mysql/group.model');
const User = require('../models/mysql/user.model');
const NotificationService = require('../utils/notification.service');


//create group

const createGroup = async(req,res)=>{
    try{
        const {name,description} =req.body;

        if(!name)
        {
            return res.status(400).json({
                success:false,
                message:'Group name required'
            });
        }

        const groupId =await Group.create(name , description || ' ',req.user.id);

        //creator as first member

        await Group.addMember(groupId,req.user.id);

        // Log activity
        await NotificationService.logActivity(
            groupId,req.user.id,'GROUP_CREATED',
            `${req.user.name} created group "${name}"`,
            {groupName:name}
        );

        res.status(201).json({
            success:true,
            message:'Group created successfully',
            group: {id: groupId , name , description,created_by : req.user.id}
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

//get my group

const getMyGroup = async(req,res)=>{
    try{

        const groups = await Group.findById(req.user.id);

        res.status(200).json({
            success:true,
            count:groups.length,
            groups
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Server error',
            error: error.message
        });
    }
};

//get single group

const getGroup = async(req,res)=>{
    try{

        const group =await Group.findById(req.params.id);

        if(!group)
        {
            return res.status(404).json({
                success:false,
                message:'Group not found'
            });
        }

        //user is member!

        const isMember = await Group.isMember(req.params.id,req.user.id);
        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message:'Not a menber of this group'
            });
        }

        //get member list
        const members = await Group.getMembers(req.params.id);

        res.status(200).json({
            success:true,
            group:{...group,members}
        });
    }
    catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Server error',
            error: error.message
        });
    }
};

//add member

const addMember = async(req,res)=>{
    try{
        const {email}= req.body;

        if(!email)
        {
            return res.status(400).json({
                success:false,
                message: 'Email is reuired'
            });
        }

        //group exists
        const group = await Group.findById(req.params.id);

        if(!group)
        {
            return res.status(404).json({
                success:false,
                message:'Group not found'
            });
        }

        //requrester is member

        const isMember = await Group.isMember(req.params.id,req.user.id);

        if(!isMember)
        {
            return res.status(403).json({
                success:false,
                message:'Not a menber of this group'
            });
        }

        //find user to add 

        const userToAdd = await User.findByEmail(email);

        if(!userToAdd)
        {
            return res.status(404).json({
                success:false,
                message:'No user Found with this email'
            });
        }

        //already a member 

        const alreadyMember = await Group.isMember(req.params.id,userToAdd.id);

        if(alreadyMember)
        {
            return res.status(400).json
            ({
                success:false,
                message:'User is already a member'
            });
        }

        //add member

        await Group.addMember(req.params.id,userToAdd.id);

        //log activity 

        await NotificationService.logActivity(
            req.params.id,
            req.user.id,
            'MEMBER_JOINED',
            `${userToAdd.name} joined the group`,
            {newMemberId: userToAdd.id}
        );

        //send Notification
        await NotificationService.sendNotification(
            [userToAdd.id],
            req.params.id,
            `You have been added to group "${group.name}"`,
            'MEMBER_JOINED'
        );

        res.status(200).json({
            success:true,
            message:`${userToAdd.name} added to group successfully`
        });
    }
     catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Server error',
            error: error.message
        });
    }
};

//delete group

const deleteGroup =async(req,res)=>{

    try{

        const group = await Group.findById(req.params.id);

        if(!group){
            return res.status(404).json({
                success:false,
                message:'Group not found'
            });
        }

        //only creator can delete

        if(group.created_by !=req.user.id){
            return res.status(403).json({
                success:false,
                message:'Only creator can delte the group'
            });
        }

        await Group.delete(req.params.id);

        res.status(200).json({
            success:true,
            message:'Group deleted successfully'
        });
    }
     catch(error)
    {
        return res.status(500).json({
            success:false,
            message:'Server error',
            error: error.message
        });
    }
};


module.exports ={createGroup,getMyGroup,getGroup,addMember,deleteGroup};