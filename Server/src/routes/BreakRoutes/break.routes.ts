import { Router } from 'express';
import { createBreakType, getBreakTypes, updateBreakType, toggleBreakTypeStatus,deleteBreakType } from '../../controllers/Break/breakType.controller';

const router = Router();


router.post('/', createBreakType);
router.get('/', getBreakTypes);
router.put('/:id', updateBreakType);
router.patch('/:id/toggle-status', toggleBreakTypeStatus);
router.delete('/:id', deleteBreakType);

export default router;
