// import { Router } from 'express';
// import { login, logout, checkSession } from '../controllers/auth.controller';
// import { ipCheckMiddleware } from '../middleware/ipCheck.middleware';
// import { authMiddleware } from '../middleware/auth.middleware';
// import { sessionMiddleware } from '../middleware/session.middleware';

// const router = Router();

// // PHP: login.php -> query.php?action=login
// router.post('/login', ipCheckMiddleware, login);

// // PHP: query.php?action=logout
// router.post('/logout', authMiddleware, logout);

// // PHP: Check session (from index.php)
// router.get('/session', authMiddleware, sessionMiddleware, checkSession);

// export default router;


import { Router } from 'express';
import { 
  login, 
  logout, 
  checkSession,
  getActiveUsers,
} from '../controllers/auth.controller';
import { ipCheckMiddleware } from '../middleware/ipCheck.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { sessionMiddleware } from '../middleware/session.middleware';

const router = Router();


router.post('/login', ipCheckMiddleware, login);

router.post('/logout', authMiddleware, logout);

router.get('/active-users', authMiddleware, getActiveUsers);

router.get('/session', authMiddleware, sessionMiddleware, checkSession);


export default router;
