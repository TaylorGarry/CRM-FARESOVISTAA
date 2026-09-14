import { Request, Response, NextFunction } from 'express';
import { IP } from '../models/Auth/IP.model';

// PHP: IP restriction from login.php
export const ipCheckMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clientIP = req.ip || req.socket.remoteAddress || '';
    const cleanIP = clientIP.replace('::ffff:', '');
    
    // PHP: $sqll = mysqli_query($conn,"select pcip_no From tbl_ip where ip_id!='' and pcip_no='$ip'")
    const ipRecord = await IP.findOne({ pcip_no: cleanIP });
    
    // PHP: if(!$tot_discount){ die('This website cannot be accessed from your location.'); }
    if (!ipRecord) {
      res.status(403).send('This website cannot be accessed from your location.');
      return;
    }
    
    next();
  } catch (error) {
    console.error('IP check error:', error);
    res.status(500).json({ success: false, message: 'IP check failed' });
  }
};