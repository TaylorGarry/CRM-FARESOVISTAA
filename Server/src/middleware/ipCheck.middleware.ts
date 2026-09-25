// import { Request, Response, NextFunction } from 'express';
// import { IP } from '../models/Auth/IP.model';

// // PHP: IP restriction from login.php
// export const ipCheckMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
//   try {
//     const clientIP = req.ip || req.socket.remoteAddress || '';
//     const cleanIP = clientIP.replace('::ffff:', '');
    
//     // PHP: $sqll = mysqli_query($conn,"select pcip_no From tbl_ip where ip_id!='' and pcip_no='$ip'")
//     const ipRecord = await IP.findOne({ pcip_no: cleanIP });
    
//     // PHP: if(!$tot_discount){ die('This website cannot be accessed from your location.'); }
//     if (!ipRecord) {
//       res.status(403).send('This website cannot be accessed from your location.');
//       return;
//     }
    
//     next();
//   } catch (error) {
//     console.error('IP check error:', error);
//     res.status(500).json({ success: false, message: 'IP check failed' });
//   }
// };


import { Request, Response, NextFunction } from 'express';
import IpRestrictionModel from '../models/IPRestriction/IpRestriction.model';

const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];

  let ip = '';

  if (typeof forwarded === 'string' && forwarded.length > 0) {
    ip = forwarded.split(',')[0].trim();
  } else if (Array.isArray(forwarded) && forwarded.length > 0) {
    ip = String(forwarded[0]).split(',')[0].trim();
  } else {
    ip = req.ip || req.socket.remoteAddress || '';
  }

  if (ip.startsWith('::ffff:')) ip = ip.slice(7);
  if (ip === '::1') ip = '127.0.0.1';

  // IpRestriction schema has lowercase: true
  return ip.toLowerCase();
};

export const ipCheckMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clientIp = getClientIp(req);

    // 1. Emergency env allowlist
    const envAllowed = (process.env.IP_ALLOWLIST || '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (envAllowed.includes(clientIp)) {
      console.log('[IP CHECK] allowed via env:', clientIp);
      return next();
    }

    // 2. Dev bypass
    if (
      process.env.NODE_ENV !== 'production' &&
      (clientIp === '127.0.0.1' || clientIp === 'localhost')
    ) {
      console.log('[IP CHECK] dev bypass:', clientIp);
      return next();
    }

    // 3. Whitelist lookup — Ip_Restriction_list collection
    const matched = await IpRestrictionModel.findOne({
      user_ip: clientIp,
      status: 'Enabled',
      delete_status: false,
    }).lean();

    console.log('[IP CHECK]', {
      seenIp: clientIp,
      rawIp: req.ip,
      forwarded: req.headers['x-forwarded-for'],
      matched: !!matched,
      path: req.path,
    });

    if (!matched) {
      res
        .status(403)
        .send('This website cannot be accessed from your location.');
      return;
    }

    next();
  } catch (error) {
    console.error('[IP CHECK] error:', error);
    res.status(500).json({
      success: false,
      message: 'IP check failed',
    });
  }
};