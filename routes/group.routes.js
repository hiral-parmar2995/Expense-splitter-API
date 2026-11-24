const express = require('express');
const router = express.Router();
const { createGroup , getMyGroup,getGroup,addMember,deleteGroup}= require('../controllers/group.controller');
const {protect} =require('../middleware/auth.middleware');

router.use(protect);

router.post('/',createGroup);
router.get('/',getMyGroup);
router.get('/:id',getGroup);
router.post('/:id/members',addMember);
router.delete('/:id',deleteGroup);

module.exports=router;