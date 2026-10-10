import express from 'express';
import { LoanController } from '../controllers/loanController.js';

const router = express.Router();

router.get('/', LoanController.getLoans);
router.get('/:id', LoanController.getLoanById);
router.post('/', LoanController.createLoan);
router.put('/:id', LoanController.updateLoan(false));
router.patch('/:id', LoanController.updateLoan(true));
router.delete('/:id', LoanController.deleteLoan);

export default router;
