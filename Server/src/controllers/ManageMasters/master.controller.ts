import { Request, Response } from 'express';
import { BookingType } from "../../models/ManageMasters/BookingType.model";
import { Currency } from '../../models/ManageMasters/Currency.model';
import { Source } from '../../models/ManageMasters/Source.model';
import { CardType } from '../../models/ManageMasters/CardType.model';
import { EmailTemplate } from '../../models/ManageMasters/EmailTemplate.model';
import { SaleType } from '../../models/ManageMasters/SaleType.model';
import { AssignBookingStatus } from '../../models/ManageMasters/AssignBookingStatus.model';
import { Role } from "../../models/Auth/Role.model";

const getUserId = (req: Request): string => {
  const anyReq = req as any;
  return String(anyReq.user?.user_id ?? anyReq.user?.userId ?? anyReq.user?.id ?? anyReq.user?._id ?? '0');
};

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/* ==================== BOOKING TYPE ==================== */
export const getBookingTypes = async (_req: Request, res: Response) => {
  try {
    const data = await BookingType.find({ delete_status: false }).sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking types' });
  }
};

export const createBookingType = async (req: Request, res: Response) => {
  try {
    const { call_type_name, call_type_status } = req.body;
    const existing = await BookingType.findOne({
      call_type_name: { $regex: `^${escapeRegex(call_type_name)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await BookingType.create({
      call_type_name,
      call_type_status: call_type_status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create booking type' });
  }
};

export const updateBookingType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { call_type_name, call_type_status } = req.body;
    const existing = await BookingType.findOne({
      call_type_name: { $regex: `^${escapeRegex(call_type_name)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await BookingType.findByIdAndUpdate(
      id,
      { call_type_name, call_type_status, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update booking type' });
  }
};

export const deleteBookingType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await BookingType.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete booking type' });
  }
};

export const toggleBookingTypeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await BookingType.findByIdAndUpdate(
      id,
      { call_type_status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== CURRENCY ==================== */
export const getCurrencies = async (_req: Request, res: Response) => {
  try {
    const data = await Currency.find({ delete_status: false }).sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch currencies' });
  }
};

export const createCurrency = async (req: Request, res: Response) => {
  try {
    const { currency_name, crency_symbol, currency_status } = req.body;
    const existing = await Currency.findOne({
      currency_name: { $regex: `^${escapeRegex(currency_name)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await Currency.create({
      currency_name,
      crency_symbol,
      currency_status: currency_status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create currency' });
  }
};

export const updateCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { currency_name, crency_symbol, currency_status } = req.body;
    const existing = await Currency.findOne({
      currency_name: { $regex: `^${escapeRegex(currency_name)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await Currency.findByIdAndUpdate(
      id,
      { currency_name, crency_symbol, currency_status, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update currency' });
  }
};

export const deleteCurrency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Currency.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete currency' });
  }
};

export const toggleCurrencyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await Currency.findByIdAndUpdate(
      id,
      { currency_status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== SOURCE (Charging Bifurcation) ==================== */
export const getSources = async (_req: Request, res: Response) => {
  try {
    const data = await Source.find({ delete_status: false })
    // .populate('add_by', 'user_name name email')
    .sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch sources' });
  }
};

export const createSource = async (req: Request, res: Response) => {
  try {
    const { source_name, source_status } = req.body;
    const existing = await Source.findOne({
      source_name: { $regex: `^${escapeRegex(source_name)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await Source.create({
      source_name,
      source_status: source_status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create source' });
  }
};

export const updateSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { source_name, source_status } = req.body;
    const existing = await Source.findOne({
      source_name: { $regex: `^${escapeRegex(source_name)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await Source.findByIdAndUpdate(
      id,
      { source_name, source_status, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update source' });
  }
};

export const deleteSource = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await Source.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete source' });
  }
};

export const toggleSourceStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await Source.findByIdAndUpdate(
      id,
      { source_status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== CARD TYPE ==================== */
export const getCardTypes = async (_req: Request, res: Response) => {
  try {
    const data = await CardType.find({ delete_status: false }).sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch card types' });
  }
};

export const createCardType = async (req: Request, res: Response) => {
  try {
    const { card_type_name, card_type_status } = req.body;
    const existing = await CardType.findOne({
      card_type_name: { $regex: `^${escapeRegex(card_type_name)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await CardType.create({
      card_type_name,
      card_type_status: card_type_status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create card type' });
  }
};

export const updateCardType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { card_type_name, card_type_status } = req.body;
    const existing = await CardType.findOne({
      card_type_name: { $regex: `^${escapeRegex(card_type_name)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await CardType.findByIdAndUpdate(
      id,
      { card_type_name, card_type_status, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update card type' });
  }
};

export const deleteCardType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await CardType.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete card type' });
  }
};

export const toggleCardTypeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await CardType.findByIdAndUpdate(
      id,
      { card_type_status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== EMAIL TEMPLATE ==================== */
export const getEmailTemplates = async (_req: Request, res: Response) => {
  try {
    const data = await EmailTemplate.find({ delete_status: false }).sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch email templates' });
  }
};

export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { tamplate_name, Template_Type, email_sub, email_body, status } = req.body;
    const existing = await EmailTemplate.findOne({
      tamplate_name: { $regex: `^${escapeRegex(tamplate_name)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await EmailTemplate.create({
      tamplate_name,
      Template_Type: Template_Type || 'New booking',
      email_sub,
      email_body,
      status: status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create email template' });
  }
};

export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tamplate_name, Template_Type, email_sub, email_body, status } = req.body;
    const existing = await EmailTemplate.findOne({
      tamplate_name: { $regex: `^${escapeRegex(tamplate_name)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await EmailTemplate.findByIdAndUpdate(
      id,
      {
        tamplate_name,
        Template_Type,
        email_sub,
        email_body,
        status,
        update_by: getUserId(req),
        update_date: new Date(),
      },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update email template' });
  }
};

export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await EmailTemplate.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete email template' });
  }
};

export const toggleEmailTemplateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await EmailTemplate.findByIdAndUpdate(
      id,
      { status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== SALE TYPE ==================== */
export const getSaleTypes = async (_req: Request, res: Response) => {
  try {
    const data = await SaleType.find({ delete_status: false }).sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch sale types' });
  }
};

export const createSaleType = async (req: Request, res: Response) => {
  try {
    const { seal_type, seal_status } = req.body;
    const existing = await SaleType.findOne({
      seal_type: { $regex: `^${escapeRegex(seal_type)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await SaleType.create({
      seal_type,
      seal_status: seal_status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });
    res.json({ success: true, message: 'Add Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to create sale type' });
  }
};

export const updateSaleType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { seal_type, seal_status } = req.body;
    const existing = await SaleType.findOne({
      seal_type: { $regex: `^${escapeRegex(seal_type)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

    const data = await SaleType.findByIdAndUpdate(
      id,
      { seal_type, seal_status, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update sale type' });
  }
};

export const deleteSaleType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await SaleType.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete sale type' });
  }
};

export const toggleSaleTypeStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await SaleType.findByIdAndUpdate(
      id,
      { seal_status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ==================== ASSIGN BOOKING STATUS ==================== */
export const getAssignBookingStatuses = async (_req: Request, res: Response) => {
  try {
    const data = await AssignBookingStatus.find({ delete_status: false })
      .populate('role_id', 'role_name role_id')
      .sort({ add_date: -1 });
    res.json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to fetch assign booking statuses' });
  }
};

// export const createAssignBookingStatus = async (req: Request, res: Response) => {
//   try {
//     const { role_id, bookingstatusname, color, status } = req.body;

//     const roleExists = await Role.findById(role_id);
//     if (!roleExists) {
//       return res.status(400).json({ success: false, message: 'Invalid role/department selected' });
//     }

//     const existing = await AssignBookingStatus.findOne({
//       role_id,
//       bookingstatusname: { $regex: `^${escapeRegex(bookingstatusname)}$`, $options: 'i' },
//       delete_status: false,
//     });
//     if (existing) return res.status(400).json({ success: false, message: 'Record Already Exist!' });

//     const data = await AssignBookingStatus.create({
//       role_id,
//       bookingstatusname,
//       color: color || '#000000',
//       status: status || 'Enabled',
//       add_by: getUserId(req),
//       add_date: new Date(),
//       delete_status: false,
//     });

//     const populated = await AssignBookingStatus.findById(data._id).populate('role_id', 'role_name role_id');
//     res.json({ success: true, message: 'Add Successfully !!', data: populated });
//   } catch (e) {
//     res.status(500).json({ success: false, message: 'Failed to create assign booking status' });
//   }
// };
export const createAssignBookingStatus = async (req: Request, res: Response) => {
  try {
    const { role_id, bookingstatusname, color, status } = req.body;

    let roleDoc = null;
    if (typeof role_id === 'string' && /^[a-fA-F0-9]{24}$/.test(role_id)) {
      roleDoc = await Role.findById(role_id);
    } else {
      roleDoc = await Role.findOne({
        role_name: role_id,
        $or: [{ delete_status: 'False' }, { delete_status: false }, { delete_status: { $exists: false } }],
      });
    }

    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role/department selected',
      });
    }

    const resolvedRoleId = String(roleDoc._id);

    const existing = await AssignBookingStatus.findOne({
      role_id: resolvedRoleId,
      bookingstatusname: { $regex: `^${escapeRegex(bookingstatusname)}$`, $options: 'i' },
      delete_status: false,
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Record Already Exist!' });
    }

    const data = await AssignBookingStatus.create({
      role_id: resolvedRoleId,
      bookingstatusname,
      color: color || '#000000',
      status: status || 'Enabled',
      add_by: getUserId(req),
      add_date: new Date(),
      delete_status: false,
    });

    const populated = await AssignBookingStatus.findById(data._id)
      .populate('role_id', 'role_name role_id');

    res.json({ success: true, message: 'Add Successfully !!', data: populated });
  } catch (e: any) {
    console.error('[createAssignBookingStatus] ERROR:', e);
    res.status(500).json({
      success: false,
      message: 'Failed to create assign booking status',
      error: e?.message,
    });
  }
};
export const updateAssignBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role_id, bookingstatusname, color, status } = req.body;

    // ---- Resolve role: accept either ObjectId or role_name ----
    let roleDoc = null;
    if (typeof role_id === 'string' && /^[a-fA-F0-9]{24}$/.test(role_id)) {
      roleDoc = await Role.findById(role_id);
    } else {
      roleDoc = await Role.findOne({ role_name: role_id, delete_status: false });
    }

    if (!roleDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role/department selected',
      });
    }

    const resolvedRoleId = String(roleDoc._id);

    const existing = await AssignBookingStatus.findOne({
      role_id: resolvedRoleId,
      bookingstatusname: { $regex: `^${escapeRegex(bookingstatusname)}$`, $options: 'i' },
      delete_status: false,
      _id: { $ne: id },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Record Already Exist!' });
    }

    const data = await AssignBookingStatus.findByIdAndUpdate(
      id,
      {
        role_id: resolvedRoleId,
        bookingstatusname,
        color: color || '#000000',
        status,
        update_by: getUserId(req),
        update_date: new Date(),
      },
      { new: true }
    )
      .populate('role_id', 'role_name role_id');

    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Update Successfully !!', data });
  } catch (e: any) {
    console.error('[updateAssignBookingStatus] ERROR:', e);
    res.status(500).json({
      success: false,
      message: 'Failed to update assign booking status',
      error: e?.message,
    });
  }
};

export const deleteAssignBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await AssignBookingStatus.findByIdAndUpdate(
      id,
      { delete_status: true, delete_by: getUserId(req), delete_date: new Date() },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Deleted Successfully !!' });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to delete assign booking status' });
  }
};

export const toggleAssignBookingStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const newStatus = status === 'Enabled' ? 'Disabled' : 'Enabled';
    const data = await AssignBookingStatus.findByIdAndUpdate(
      id,
      { status: newStatus, update_by: getUserId(req), update_date: new Date() },
      { new: true }
    ).populate('role_id', 'role_name role_id');
    if (!data) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Status updated successfully', data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

export const getRolesForAssignBooking = async (_req: Request, res: Response) => {
  try {
    console.log('[getRolesForAssignBooking] Model collection name:',
      Role.collection.name);

    const total = await Role.countDocuments({});
    console.log('[getRolesForAssignBooking] Total docs in collection:', total);

    const sample = await Role.find({}).limit(3).lean();
    console.log('[getRolesForAssignBooking] Sample docs:',
      JSON.stringify(sample, null, 2));

    const withFalseString = await Role.countDocuments({ delete_status: 'False' });
    console.log('[getRolesForAssignBooking] count delete_status="False":',
      withFalseString);

    const withFalseBoolean = await Role.countDocuments({ delete_status: false });
    console.log('[getRolesForAssignBooking] count delete_status=false:',
      withFalseBoolean);

    const roles = await Role.find({
      $or: [
        { delete_status: 'False' },
        { delete_status: false },
        { delete_status: { $exists: false } },
      ],
    })
      .select('role_id role_name _id delete_status')
      .sort({ role_name: 1 });

    console.log('[getRolesForAssignBooking] Found roles:', roles.length);

    res.json({ success: true, data: roles });
  } catch (e: any) {
    console.error('[getRolesForAssignBooking] ERROR:', e);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch roles',
      error: e?.message,
    });
  }
};
