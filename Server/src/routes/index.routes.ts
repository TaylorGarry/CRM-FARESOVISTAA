// import { Router } from 'express';
// import authRoutes from './auth.routes';
// import passwordRoutes from './password.routes';

// const router = Router();

// router.use('/auth', authRoutes);
// router.use('/password', passwordRoutes);

// export default router;

import { Router } from 'express';
import authRoutes from './auth.routes';
import passwordRoutes from './password.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/password', passwordRoutes);
router.use('/', userRoutes); // or router.use('/users', userRoutes);

export default router;