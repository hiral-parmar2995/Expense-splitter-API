const express = require ('express');
const router =  express.Router();
const { addExpense, getGroupExpenses, getExpenseDetail, deleteExpense } = require('../controllers/expense.controller');
const {protect} = require('../middleware/auth.middleware');


router.use(protect);

router.post('/',addExpense);
router.get('/:groupId',getGroupExpenses);
router.get('/detail/:id',getExpenseDetail);
router.delete('/:id',deleteExpense);

module.exports=router;