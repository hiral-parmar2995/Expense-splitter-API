const express = require('express')
const router = express.Router();
const { getSettlement,settleUp,getHistory} = require('../controllers/settlement.controller')
const {protect} = require('../middleware/auth.middleware')

router.use(protect);

router.get('/:groupId',getSettlement);
router.post('/:groupId/settle',settleUp);
router.get('/:groupId/history',getHistory);

module.exports =router ;
