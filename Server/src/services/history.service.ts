import { UserHistory } from '../models/Auth/UserHistory.model';
import { BreakDetail } from '../models/Auth/BreakDetail.model';
import { getDateYMD, getCurrentTimestamp } from './token.service';

export interface HistoryData {
  uhist_userid: number;
  uhist_udept: string;
  uhist_ip?: string;
}

// PHP: INSERT INTO tbl_userhistory
export const createUserHistory = async (data: HistoryData): Promise<number> => {
  const history = new UserHistory({
    uhist_userid: data.uhist_userid,
    uhist_logindate: getDateYMD(),
    uhist_logintime: getCurrentTimestamp(),
    uhist_udept: data.uhist_udept,
    uhist_logouttime: '',
    uhist_ip: data.uhist_ip || '',
  });

  await history.save();
  return history.uhist_id;
};

// PHP: UPDATE tbl_userhistory SET uhist_logouttime = '...'
export const updateUserHistoryLogout = async (uhist_id: number): Promise<void> => {
  await UserHistory.findOneAndUpdate(
    { uhist_id },
    { uhist_logouttime: getCurrentTimestamp() }
  );
};

// PHP: SELECT COUNT(*) FROM tbl_break_details WHERE ...
export const getActiveBreak = async (userId: number): Promise<any> => {
  return await BreakDetail.findOne({
    delete_status: 'False',
    break_details_status: 'Enabled',
    add_by: userId
  });
};

// PHP: UPDATE tbl_break_details SET break_details_status='Disabled'
export const disableBreak = async (breakId: number, userId: number): Promise<void> => {
  await BreakDetail.findOneAndUpdate(
    { break_details_id: breakId },
    {
      break_details_status: 'Disabled',
      update_date: new Date(),
      update_by: userId
    }
  );
};
