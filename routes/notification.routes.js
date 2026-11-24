const express = require('express')
const router = express.Router();
const {getMyNotifications,getGroupActivity,markAllRead} = require('../controllers/notification.controller');
const {protect} =require('../middleware/auth.middleware');

router.use(protect);

router.get('/',getMyNotifications);
router.get('/group/:groupId',getGroupActivity);
router.put('/read',markAllRead);

module.exports=router;