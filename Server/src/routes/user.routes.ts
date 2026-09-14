import { Router } from 'express';
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { sessionMiddleware } from '../middleware/session.middleware';
import { activityMiddleware } from '../middleware/activity.middleware';
import { createRole, listRoles, updateRole, deleteRole, toggleRoleStatus, listModules, listSubmodules, listPermissions, savePermission } from '../controllers/access.controller';

const router = Router();

router.use(authMiddleware, sessionMiddleware);

router.post('/users', createUser);

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/status', toggleUserStatus);

router.get('/roles', listRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.delete('/roles/:id', deleteRole);
router.patch('/roles/:id/status', toggleRoleStatus);
router.get('/modules', listModules);
router.get('/submodules', listSubmodules);
router.get('/role-permissions', listPermissions);
router.post('/role-permissions', savePermission);

export default router;
