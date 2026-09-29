import { Request, Response } from 'express';
import BookingModel, { IBooking } from '../../models/Bookings/bookings.model';
import BookingHistoryModel from "../../models/Bookings/bookingHistory.model"
import AssignmentHistoryModel from "../../models/Bookings/assignmentHistory.model"
import { Role } from '../../models/Auth/Role.model';
import { User } from '../../models/Auth/User.model';
import { verifyToken } from '../../services/token.service';

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

interface AuthUser {
  user_id: number | string;
  user_login: string;
  user_name: string;
  user_role?: string;
  isAdmin?: boolean;
}

const getUser = (req: Request): AuthUser => {
  const anyReq = req as any;
  const token = req.headers.authorization?.replace('Bearer ', '');
  const u = anyReq.user || (token ? verifyToken(token) : null) || {};

  return {
    user_id: u.userId ?? u.id ?? u._id ?? u.user_id ?? '0',
    user_login: u.user_login ?? u.login ?? 'unknown',
    user_name: u.user_name ?? u.name ?? u.user_login ?? u.login ?? 'unknown',
    user_role: u.user_role,
    isAdmin: u.isAdmin ?? false,
  };
};

const getUserId = (req: Request): string => String(getUser(req).user_id);

const getUserDepartments = async (req: Request): Promise<string[]> => {
  const user = getUser(req);
  if (!user.user_role) return [];

  const roleId = Number(user.user_role);
  const roleQuery = Number.isInteger(roleId)
    ? { $or: [{ role_id: roleId }, { role_name: user.user_role }] }
    : { role_name: user.user_role };
  const role = await Role.findOne(roleQuery).select('role_name department_role').lean();

  return Array.from(new Set(
    [role?.role_name, role?.department_role]
      .map(value => value?.trim())
      .filter((value): value is string => Boolean(value))
  ));
};

const getBookingVisibilityFilter = async (req: Request): Promise<Record<string, any> | null> => {
  const user = getUser(req);

  if (user.isAdmin || user.user_role?.trim().toLowerCase() === 'admin') {
    return null;
  }

  const userId = String(user.user_id);
  const departments = await getUserDepartments(req);
  const latestAssignments = await AssignmentHistoryModel.aggregate([
    { $sort: { assign_date: -1, _id: -1 } },
    {
      $group: {
        _id: '$booking_id',
        department: { $first: '$department' },
        assign_to: { $first: '$assign_to' },
        assign_to_login: { $first: '$assign_to_login' },
      },
    },
  ]);
  const assignedBookingIds = latestAssignments
    .filter(assignment =>
      departments.includes(String(assignment.department || '').trim()) ||
      String(assignment.assign_to || '') === String(user.user_id) ||
      String(assignment.assign_to_login || '') === user.user_login
    )
    .map(assignment => String(assignment._id));

  return {
    $or: [
      { add_by: userId },
      { add_by: user.user_login },
      { add_by: getUserDisplayName(user) },
      { _id: { $in: assignedBookingIds } },
    ],
  };
};

/**
 * Write a row into Booking_history.
 * `isSystem=true` → auto-generated (lock acquire, tab save, force-unlock, etc.)
 * `isSystem=false` → typed by a human (Add Remarks)
 */
const writeBookingHistory = async (opts: {
  bookingId: string;
  pnr: string;
  bookingStatus: string;
  remarks: string;
  user: AuthUser;
  isSystem: boolean;
}) => {
  try {
    await BookingHistoryModel.create({
      booking_id: String(opts.bookingId),
      pnr: opts.pnr,
      booking_status: opts.bookingStatus,
      remarks: opts.remarks,
      update_by: String(opts.user.user_id),
      update_by_login: opts.user.user_login,
      update_by_name: opts.user.user_name,
      is_system: opts.isSystem,
    });
  } catch (err) {
    console.error('writeBookingHistory error:', err);
  }
};

const getUserDisplayName = (user: AuthUser) =>
  user.user_name && user.user_name !== 'unknown' ? user.user_name : user.user_login;

const enrichAssignmentNames = async (rows: any[]) => {
  const userIds = Array.from(new Set(
    rows
      .map(row => String(row.assign_by || '').trim())
      .filter(value => /^\d+$/.test(value))
  )).map(Number);
  const users = userIds.length
    ? await User.find({ user_id: { $in: userIds } }).select('user_id user_login user_name').lean()
    : [];
  const usersById = new Map(users.map(user => [String(user.user_id), user]));

  return rows.map(row => {
    const assigner = usersById.get(String(row.assign_by || ''));
    return {
      ...row,
      assign_by_name: row.assign_by_name || row.assign_by_login || assigner?.user_name || assigner?.user_login || row.assign_by || '',
      assign_to_name: row.assign_to_name || row.assign_to_login || row.assign_to || '',
    };
  });
};

/**
 * Normalize + sanitize incoming booking payload (create/update).
 */
const buildBookingPayload = (body: any) => {
  const paxInput = Array.isArray(body.pax) ? body.pax : [];

  const pax = paxInput
    .filter((p: any) => p && (p.first_name || p.last_name))
    .map((p: any) => ({
      type: p.type || 'Adult',
      gender: p.gender || 'Male',
      first_name: String(p.first_name || '').trim(),
      middle_name: String(p.middle_name || '').trim(),
      last_name: String(p.last_name || '').trim(),
      dob: String(p.dob || '').trim(),
      passport_number: String(p.passport_number || '').trim(),
      pid: String(p.pid || '').trim(),
      ped: String(p.ped || '').trim(),
    }));

  return {
    pnr: String(body.pnr || '').trim().toUpperCase(),
    airline_pnr: String(body.airline_pnr || '').trim().toUpperCase(),
    customer_name: String(body.customer_name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    billing_phone: String(body.billing_phone || '').trim(),
    alternate_phone: String(body.alternate_phone || '').trim(),

    pax,

    trip_type: (body.trip_type === 'Roundtrip' ? 'Roundtrip' : 'Oneway') as 'Oneway' | 'Roundtrip',
    from: String(body.from || '').trim(),
    destination: String(body.destination || '').trim(),
    departure_date: String(body.departure_date || '').trim(),
    return_date: String(body.return_date || '').trim(),
    reason_of_sale: String(body.reason_of_sale || '').trim(),
    itinerary_html: String(body.itinerary_html || ''),

    total_amount: Number(body.total_amount) || 0,
    ticket_cost: Number(body.ticket_cost) || 0,
    airline_fee: Number(body.airline_fee) || 0,
    mco: Number(body.mco) || 0,
    currency: (body.currency === 'CAD' ? 'CAD' : 'USD') as 'USD' | 'CAD',

    card_number: String(body.card_number || '').trim(),
    cvv: String(body.cvv || '').trim(),
    card_holder_name: String(body.card_holder_name || '').trim(),
    card_type: String(body.card_type || '').trim(),
    card_expiry_month: String(body.card_expiry_month || '').trim(),
    card_expiry_year: String(body.card_expiry_year || '').trim(),

    billing_address: String(body.billing_address || '').trim(),

    address: String(body.address || '').trim(),
    address1: String(body.address1 || '').trim(),
    country_code: String(body.country_code || '').trim(),
    state: String(body.state || '').trim(),
    city: String(body.city || '').trim(),
    pincode: String(body.pincode || '').trim(),

    booking_ip: String(body.booking_ip || '').trim(),
    booking_date: body.booking_date ? new Date(body.booking_date) : null,
    gk_pnr: String(body.gk_pnr || '').trim(),
    hk_pnr: String(body.hk_pnr || '').trim(),
    airline_name: String(body.airline_name || '').trim(),
    quoted_fare: Number(body.quoted_fare) || 0,
    issuance_fee: Number(body.issuance_fee) || 0,
    arc: String(body.arc || '').trim(),
    net_mco: Number(body.net_mco) || 0,

    booking_status: String(body.booking_status || 'New Booking').trim(),
    remarks: String(body.remarks || ''),
  };
};

/* ------------------------------------------------------------------ */
/* Create                                                              */
/* ------------------------------------------------------------------ */

export const createBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const payload = buildBookingPayload(req.body);
    const user = getUser(req);

    if (!payload.pnr || !payload.customer_name || !payload.from || !payload.destination) {
      return res.status(400).json({
        success: false,
        message: 'PNR, Customer Name, From and Destination are required',
      });
    }

    if (!payload.pax.length) {
      return res.status(400).json({
        success: false,
        message: 'At least one passenger is required',
      });
    }

    const booking = await BookingModel.create({
      ...payload,
      add_by: getUserDisplayName(user),
      add_date: new Date(),
      update_by: null,
      update_date: null,
      delete_by: null,
      delete_date: null,
      delete_status: false,
      locked_by: null,
      locked_by_login: null,
      locked_by_name: null,
      locked_at: null,
      lock_session_id: null,
    });

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Booking created by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking,
    });
  } catch (error: any) {
    console.error('Create booking error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to create booking',
    });
  }
};

/* ------------------------------------------------------------------ */
/* List                                                                */
/* ------------------------------------------------------------------ */

export const getBookings = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(200, Number(req.query.limit) || 10));
    const search = String(req.query.search || '').trim();

    const filter: any = { delete_status: false };

    if (search) {
      filter.$or = [
        { pnr: { $regex: search, $options: 'i' } },
        { airline_pnr: { $regex: search, $options: 'i' } },
        { customer_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (req.query.pnr) {
      filter.pnr = { $regex: String(req.query.pnr).trim(), $options: 'i' };
    }

    if (req.query.airline_pnr) {
      filter.airline_pnr = { $regex: String(req.query.airline_pnr).trim(), $options: 'i' };
    }

    if (req.query.customer_name) {
      filter.customer_name = { $regex: String(req.query.customer_name).trim(), $options: 'i' };
    }

    if (req.query.email) {
      filter.email = { $regex: String(req.query.email).trim(), $options: 'i' };
    }

    if (req.query.booking_status) {
      filter.booking_status = String(req.query.booking_status).trim();
    }

    if (req.query.trip_type) {
      filter.trip_type = String(req.query.trip_type).trim();
    }

    if (req.query.from) {
      filter.from = { $regex: String(req.query.from).trim(), $options: 'i' };
    }

    if (req.query.destination) {
      filter.destination = { $regex: String(req.query.destination).trim(), $options: 'i' };
    }

    if (req.query.reason_of_sale) {
      filter.reason_of_sale = String(req.query.reason_of_sale).trim();
    }

    if (req.query.currency) {
      filter.currency = String(req.query.currency).trim();
    }

    if (req.query.departure_from || req.query.departure_to) {
      filter.departure_date = {};
      if (req.query.departure_from) {
        filter.departure_date.$gte = new Date(`${String(req.query.departure_from)}T00:00:00.000Z`);
      }
      if (req.query.departure_to) {
        filter.departure_date.$lte = new Date(`${String(req.query.departure_to)}T23:59:59.999Z`);
      }
    }

    const visibilityFilter = await getBookingVisibilityFilter(req);
    if (visibilityFilter) {
      const searchFilter = filter.$or;
      delete filter.$or;
      filter.$and = [
        ...(searchFilter ? [{ $or: searchFilter }] : []),
        visibilityFilter,
      ];
    }

    const [records, total] = await Promise.all([
      BookingModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      BookingModel.countDocuments(filter),
    ]);

    const assignmentRows = await AssignmentHistoryModel.find({
      booking_id: { $in: records.map(record => String(record._id)) },
    })
      .sort({ assign_date: -1 })
      .lean();
    const enrichedAssignments = await enrichAssignmentNames(assignmentRows);
    const latestAssignmentByBooking = new Map<string, any>();
    for (const assignment of enrichedAssignments) {
      if (!latestAssignmentByBooking.has(String(assignment.booking_id))) {
        latestAssignmentByBooking.set(String(assignment.booking_id), assignment);
      }
    }
    const data = records.map(record => {
      const assignment = latestAssignmentByBooking.get(String(record._id));
      return {
        ...record.toObject(),
        assign_by: assignment?.assign_by_name || 'N/A',
        assign_to: assignment?.assign_to_name || 'N/A',
      };
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      total,
      page,
      limit,
      data,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
    });
  }
};

/* ------------------------------------------------------------------ */
/* Get by id                                                           */
/* ------------------------------------------------------------------ */

export const getBookingById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const visibilityFilter = await getBookingVisibilityFilter(req);
    const booking = await BookingModel.findOne({
      _id: id,
      delete_status: false,
      ...(visibilityFilter || {}),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch booking' });
  }
};

/* ------------------------------------------------------------------ */
/* Update (legacy full update from /bookings/edit)                     */
/* ------------------------------------------------------------------ */

export const updateBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = getUser(req);

    const existing = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const payload = buildBookingPayload(req.body);

    Object.assign(existing, payload, {
      update_by: getUserDisplayName(user),
      update_date: new Date(),
    });

    await existing.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
      data: existing,
    });
  } catch (error: any) {
    console.error('Update booking error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'Failed to update booking',
    });
  }
};

/* ------------------------------------------------------------------ */
/* Status change (legacy quick status)                                 */
/* ------------------------------------------------------------------ */

export const updateBookingStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { booking_status } = req.body;
    const user = getUser(req);

    if (!booking_status) {
      return res.status(400).json({ success: false, message: 'booking_status is required' });
    }

    const existing = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    existing.booking_status = String(booking_status).trim();
    existing.update_by = getUserDisplayName(user);
    existing.update_date = new Date();
    await existing.save();

    await writeBookingHistory({
      bookingId: String(existing._id),
      pnr: existing.pnr,
      bookingStatus: existing.booking_status,
      remarks: `System Remarks: Status changed to "${existing.booking_status}" by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      data: existing,
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

/* ------------------------------------------------------------------ */
/* Soft delete                                                         */
/* ------------------------------------------------------------------ */

export const deleteBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = getUser(req);

    const existing = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    existing.delete_status = true;
    existing.delete_by = String(user.user_id);
    existing.delete_date = new Date();
    await existing.save();

    return res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to delete booking' });
  }
};

/* ------------------------------------------------------------------ */
/* LOCK                                                                */
/* ------------------------------------------------------------------ */

/**
 * POST /bookings/:id/lock
 * Acquire lock. Behavior:
 *  - unlocked                → lock for caller + history + return { locked: true, session_id }
 *  - locked by same user     → refresh lock + return { locked: true, session_id }
 *  - locked by another user  → return { locked: false, locked_by, locked_by_name, locked_at }
 */
export const lockBooking = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = getUser(req);
    const userIdStr = String(user.user_id);

    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Caller already holds a lock on a *different* booking?
    if (!booking.locked_by || booking.locked_by !== userIdStr) {
      const otherLock = await BookingModel.findOne({
        locked_by: userIdStr,
        delete_status: false,
        _id: { $ne: booking._id },
      });

      if (otherLock) {
        return res.status(409).json({
          success: false,
          code: 'OTHER_LOCK_ACTIVE',
          message: `You have an open booking (${otherLock.pnr}). Add a remark to release it first.`,
          other_lock: {
            booking_id: String(otherLock._id),
            pnr: otherLock.pnr,
          },
        });
      }
    }

    // Held by someone else
    if (booking.locked_by && booking.locked_by !== userIdStr) {
      return res.status(200).json({
        success: true,
        locked: false,
        locked_by: booking.locked_by,
        locked_by_login: booking.locked_by_login,
        locked_by_name: booking.locked_by_name,
        locked_at: booking.locked_at,
      });
    }

    // Acquire / refresh
    const isFreshAcquire = !booking.locked_by;
    const sessionId =
      booking.lock_session_id || `${userIdStr}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    booking.locked_by = userIdStr;
    booking.locked_by_login = user.user_login;
    booking.locked_by_name = getUserDisplayName(user);
    booking.locked_at = new Date();
    booking.lock_session_id = sessionId;
    await booking.save();

    if (isFreshAcquire) {
      await writeBookingHistory({
        bookingId: String(booking._id),
        pnr: booking.pnr,
        bookingStatus: booking.booking_status,
        remarks: `System Remarks: Booking opened by ${user.user_login}`,
        user,
        isSystem: true,
      });
    }

    return res.status(200).json({
      success: true,
      locked: true,
      session_id: sessionId,
      locked_at: booking.locked_at,
    });
  } catch (error) {
    console.error('Lock booking error:', error);
    return res.status(500).json({ success: false, message: 'Failed to lock booking' });
  }
};

/**
 * GET /bookings/my-lock
 * Returns the booking this user currently has locked, if any.
 */
export const getMyLock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = getUser(req);
    const userIdStr = String(user.user_id);

    const booking = await BookingModel.findOne({
      locked_by: userIdStr,
      delete_status: false,
    }).select('_id pnr locked_at lock_session_id');

    return res.status(200).json({
      success: true,
      has_lock: !!booking,
      lock: booking
        ? {
            booking_id: String(booking._id),
            pnr: booking.pnr,
            locked_at: booking.locked_at,
            session_id: booking.lock_session_id,
          }
        : null,
    });
  } catch (error) {
    console.error('Get my lock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch lock' });
  }
};

/**
 * POST /bookings/:id/remarks
 * Body: { remarks: string, booking_status?: string }
 *
 * Only the holder of the lock can add a remark and release the lock.
 */
export const addRemark = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const { remarks, booking_status } = req.body || {};
    const user = getUser(req);
    const userIdStr = String(user.user_id);

    if (!remarks || !String(remarks).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Remark is required',
      });
    }

    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.locked_by && booking.locked_by !== userIdStr) {
      return res.status(403).json({
        success: false,
        message: `This booking is locked by ${booking.locked_by_login || 'another user'}.`,
      });
    }

    // Optionally update booking_status along with the remark
    if (booking_status && String(booking_status).trim()) {
      booking.booking_status = String(booking_status).trim();
    }
    booking.remarks = String(remarks).trim();
    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();

    // Release lock
    booking.locked_by = null;
    booking.locked_by_login = null;
    booking.locked_by_name = null;
    booking.locked_at = null;
    booking.lock_session_id = null;

    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: String(remarks).trim(),
      user,
      isSystem: false,
    });

    return res.status(200).json({
      success: true,
      message: 'Remark added and lock released',
      data: booking,
    });
  } catch (error) {
    console.error('Add remark error:', error);
    return res.status(500).json({ success: false, message: 'Failed to add remark' });
  }
};

/**
 * POST /bookings/:id/force-unlock  (admin only – enforce in route or middleware)
 */
export const forceUnlock = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;
    const user = getUser(req);

    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const previousHolder = booking.locked_by_login || 'nobody';

    booking.locked_by = null;
    booking.locked_by_login = null;
    booking.locked_by_name = null;
    booking.locked_at = null;
    booking.lock_session_id = null;
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Lock force-released by ${user.user_login} (was held by ${previousHolder})`,
      user,
      isSystem: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Lock released',
    });
  } catch (error) {
    console.error('Force unlock error:', error);
    return res.status(500).json({ success: false, message: 'Failed to force unlock' });
  }
};

/* ------------------------------------------------------------------ */
/* History & Assignments                                               */
/* ------------------------------------------------------------------ */

export const getBookingHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const rows = await BookingHistoryModel.find({ booking_id: String(id) })
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error('Get booking history error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
};

export const getBookingAssignments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { id } = req.params;

    const visibilityFilter = await getBookingVisibilityFilter(req);
    const booking = await BookingModel.findOne({
      _id: id,
      delete_status: false,
      ...(visibilityFilter || {}),
    }).select('pnr itinerary_html');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const user = getUser(req);
    const isAdmin = Boolean(user.isAdmin || user.user_role?.trim().toLowerCase() === 'admin');
    const departments = isAdmin ? [] : await getUserDepartments(req);
    const rows = await AssignmentHistoryModel.find({ booking_id: String(id) })
      .sort({ assign_date: -1 })
      .lean();
    const visibleRows = isAdmin
      ? rows
      : rows.filter(row => departments.includes(String(row.department || '').trim()));
    const enrichedRows = await enrichAssignmentNames(visibleRows);

    return res.status(200).json({
      success: true,
      count: visibleRows.length,
      data: enrichedRows,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};

export const createBookingAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { booking_id, department, booking_status, remarks = '', itinerary_html = '' } = req.body;
    const departmentValue = String(department || '').trim();
    const status = String(booking_status || '').trim();
    const user = getUser(req);

    if (!booking_id || !departmentValue || !status) {
      return res.status(400).json({
        success: false,
        message: 'Booking, department and booking status are required',
      });
    }

    const visibilityFilter = await getBookingVisibilityFilter(req);
    const booking = await BookingModel.findOne({
      _id: booking_id,
      delete_status: false,
      ...(visibilityFilter || {}),
    }).select('pnr itinerary_html');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const departmentConditions: Record<string, unknown>[] = [
      { role_name: departmentValue },
      { department_role: departmentValue },
    ];
    const numericDepartment = Number(departmentValue);
    if (Number.isInteger(numericDepartment)) departmentConditions.push({ role_id: numericDepartment });
    if (/^[a-fA-F0-9]{24}$/.test(departmentValue)) departmentConditions.push({ _id: departmentValue });

    const departmentRole = await Role.findOne({
      $or: departmentConditions,
      status: 'Enabled',
      delete_status: { $ne: 'True' },
    }).select('_id role_id role_name department_role').lean();

    if (!departmentRole) {
      return res.status(400).json({ success: false, message: 'Invalid department' });
    }

    const departmentName = departmentRole.role_name || departmentRole.department_role;

    const assignment = await AssignmentHistoryModel.create({
      booking_id: String(booking._id),
      pnr: booking.pnr,
      assign_by: String(user.user_id),
      assign_by_login: user.user_login,
      assign_by_name: getUserDisplayName(user),
      department_id: String(departmentRole._id),
      department: departmentName,
      assign_to: '',
      assign_to_login: '',
      assign_to_name: '',
      booking_status: status,
      remarks: String(remarks).trim(),
      handled: false,
      itinerary_html: String(itinerary_html || booking.itinerary_html || ''),
    });

    return res.status(201).json({
      success: true,
      message: 'Booking assigned successfully',
      data: assignment,
    });
  } catch (error) {
    console.error('Create booking assignment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
};

export const listBookingAssignments = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const visibilityFilter = await getBookingVisibilityFilter(req);
    const bookingFilter = {
      delete_status: false,
      ...(visibilityFilter || {}),
    };
    const visibleBookingIds = await BookingModel.find(bookingFilter).distinct('_id');
    const user = getUser(req);
    const isAdmin = Boolean(user.isAdmin || user.user_role?.trim().toLowerCase() === 'admin');
    const departments = isAdmin ? [] : await getUserDepartments(req);
    const assignmentFilter: Record<string, any> = {
      booking_id: { $in: visibleBookingIds.map(String) },
    };
    if (!isAdmin) {
      assignmentFilter.department = { $in: departments };
    }

    const [rows, total] = await Promise.all([
      AssignmentHistoryModel.find(assignmentFilter)
        .sort({ assign_date: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      AssignmentHistoryModel.countDocuments(assignmentFilter),
    ]);

    const bookings = await BookingModel.find({
      _id: { $in: rows.map(row => row.booking_id) },
    }).select('pnr itinerary_html').lean();
    const bookingById = new Map(bookings.map(booking => [String(booking._id), booking]));

    return res.status(200).json({
      success: true,
      count: rows.length,
      total,
      page,
      limit,
      data: (await enrichAssignmentNames(rows)).map(row => ({
        ...row,
        booking: bookingById.get(String(row.booking_id)) || null,
      })),
    });
  } catch (error) {
    console.error('List booking assignments error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch assignments' });
  }
};

export const handleBookingAssignment = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const user = getUser(req);
    const assignment = await AssignmentHistoryModel.findById(req.params.assignmentId);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const visibilityFilter = await getBookingVisibilityFilter(req);
    const booking = await BookingModel.findOne({
      _id: assignment.booking_id,
      delete_status: false,
      ...(visibilityFilter || {}),
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (req.body.booking_status !== undefined) {
      assignment.booking_status = String(req.body.booking_status).trim();
    }
    if (req.body.remarks !== undefined) {
      assignment.remarks = String(req.body.remarks).trim();
    }
    assignment.handled = req.body.handled === undefined ? true : Boolean(req.body.handled);
    assignment.done_by = String(user.user_id);
    assignment.done_by_login = user.user_login;
    assignment.done_by_name = getUserDisplayName(user);
    assignment.handled_at = assignment.handled ? new Date() : null;
    await assignment.save();

    return res.status(200).json({
      success: true,
      message: assignment.handled ? 'Assignment marked as handled' : 'Assignment reopened',
      data: assignment,
    });
  } catch (error) {
    console.error('Handle booking assignment error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update assignment' });
  }
};

/* ------------------------------------------------------------------ */
/* Per-tab partial updates                                             */
/* ------------------------------------------------------------------ */

/**
 * Guard used by all per-tab PATCH handlers.
 * Only the lock holder can edit.
 */
const ensureLockHolder = async (
  booking: IBooking,
  req: Request,
  res: Response
): Promise<boolean> => {
  const user = getUser(req);
  const userIdStr = String(user.user_id);

  if (booking.locked_by && booking.locked_by !== userIdStr) {
    res.status(403).json({
      success: false,
      message: `This booking is locked by ${booking.locked_by_login || 'another user'}.`,
    });
    return false;
  }
  return true;
};

/* --- User Search tab --- */
export const updateSearchInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);
    booking.trip_type = req.body.trip_type === 'Roundtrip' ? 'Roundtrip' : 'Oneway';
    booking.from = String(req.body.from || '').trim();
    booking.destination = String(req.body.destination || '').trim();
    booking.departure_date = String(req.body.departure_date || '').trim();
    booking.return_date = String(req.body.return_date || '').trim();
    booking.reason_of_sale = String(req.body.reason_of_sale || '').trim();
    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Search info updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Search info updated', data: booking });
  } catch (error) {
    console.error('updateSearchInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update search info' });
  }
};

/* --- Booking Info tab --- */
export const updateBookingInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);

    if (req.body.booking_status !== undefined) {
      booking.booking_status = String(req.body.booking_status).trim();
    }
    if (req.body.reason_of_sale !== undefined) {
      booking.reason_of_sale = String(req.body.reason_of_sale).trim();
    }
    if (req.body.pnr !== undefined) {
      booking.pnr = String(req.body.pnr).trim().toUpperCase();
    }
    if (req.body.gk_pnr !== undefined) booking.gk_pnr = String(req.body.gk_pnr).trim();
    if (req.body.hk_pnr !== undefined) booking.hk_pnr = String(req.body.hk_pnr).trim();
    if (req.body.airline_pnr !== undefined) {
      booking.airline_pnr = String(req.body.airline_pnr).trim().toUpperCase();
    }
    if (req.body.airline_name !== undefined) booking.airline_name = String(req.body.airline_name).trim();

    if (req.body.currency !== undefined) {
      booking.currency = req.body.currency === 'CAD' ? 'CAD' : 'USD';
    }
    if (req.body.ticket_cost !== undefined) booking.ticket_cost = Number(req.body.ticket_cost) || 0;
    if (req.body.mco !== undefined) booking.mco = Number(req.body.mco) || 0;
    if (req.body.quoted_fare !== undefined) booking.quoted_fare = Number(req.body.quoted_fare) || 0;
    if (req.body.issuance_fee !== undefined) booking.issuance_fee = Number(req.body.issuance_fee) || 0;
    if (req.body.arc !== undefined) booking.arc = String(req.body.arc).trim();
    if (req.body.net_mco !== undefined) booking.net_mco = Number(req.body.net_mco) || 0;

    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Booking info updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Booking info updated', data: booking });
  } catch (error) {
    console.error('updateBookingInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update booking info' });
  }
};

/* --- Itinerary tab --- */
export const updateItinerary = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);
    booking.itinerary_html = String(req.body.itinerary_html || '');
    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Itinerary updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Itinerary updated', data: booking });
  } catch (error) {
    console.error('updateItinerary error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update itinerary' });
  }
};

/* --- Contact Info tab --- */
export const updateContactInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);

    if (req.body.customer_name !== undefined) booking.customer_name = String(req.body.customer_name).trim();
    if (req.body.email !== undefined) booking.email = String(req.body.email).trim().toLowerCase();
    if (req.body.billing_phone !== undefined) booking.billing_phone = String(req.body.billing_phone).trim();
    if (req.body.alternate_phone !== undefined) booking.alternate_phone = String(req.body.alternate_phone).trim();

    if (req.body.address !== undefined) booking.address = String(req.body.address).trim();
    if (req.body.address1 !== undefined) booking.address1 = String(req.body.address1).trim();
    if (req.body.country_code !== undefined) booking.country_code = String(req.body.country_code).trim();
    if (req.body.state !== undefined) booking.state = String(req.body.state).trim();
    if (req.body.city !== undefined) booking.city = String(req.body.city).trim();
    if (req.body.pincode !== undefined) booking.pincode = String(req.body.pincode).trim();

    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Contact info updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Contact info updated', data: booking });
  } catch (error) {
    console.error('updateContactInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update contact info' });
  }
};

/* --- Passenger Info tab --- */
export const updatePaxInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);
    const paxInput = Array.isArray(req.body.pax) ? req.body.pax : [];

    const pax = paxInput
      .filter((p: any) => p && (p.first_name || p.last_name))
      .map((p: any) => ({
        type: p.type || 'Adult',
        gender: p.gender || 'Male',
        first_name: String(p.first_name || '').trim(),
        middle_name: String(p.middle_name || '').trim(),
        last_name: String(p.last_name || '').trim(),
        dob: String(p.dob || '').trim(),
        passport_number: String(p.passport_number || '').trim(),
        pid: String(p.pid || '').trim(),
        ped: String(p.ped || '').trim(),
      }));

    if (!pax.length) {
      return res.status(400).json({ success: false, message: 'At least one passenger is required' });
    }

    booking.pax = pax;
    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Passenger info updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Passenger info updated', data: booking });
  } catch (error) {
    console.error('updatePaxInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update pax info' });
  }
};

/* --- Payment Info tab --- */
export const updatePaymentInfo = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const booking = await BookingModel.findOne({ _id: id, delete_status: false });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!(await ensureLockHolder(booking, req, res))) return res;

    const user = getUser(req);

    if (req.body.card_number !== undefined) booking.card_number = String(req.body.card_number).trim();
    if (req.body.cvv !== undefined) booking.cvv = String(req.body.cvv).trim();
    if (req.body.card_holder_name !== undefined) booking.card_holder_name = String(req.body.card_holder_name).trim();
    if (req.body.card_type !== undefined) booking.card_type = String(req.body.card_type).trim();
    if (req.body.card_expiry_month !== undefined) booking.card_expiry_month = String(req.body.card_expiry_month).trim();
    if (req.body.card_expiry_year !== undefined) booking.card_expiry_year = String(req.body.card_expiry_year).trim();

    booking.update_by = getUserDisplayName(user);
    booking.update_date = new Date();
    await booking.save();

    await writeBookingHistory({
      bookingId: String(booking._id),
      pnr: booking.pnr,
      bookingStatus: booking.booking_status,
      remarks: `System Remarks: Payment info updated by ${user.user_login}`,
      user,
      isSystem: true,
    });

    return res.status(200).json({ success: true, message: 'Payment info updated', data: booking });
  } catch (error) {
    console.error('updatePaymentInfo error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update payment info' });
  }
};
