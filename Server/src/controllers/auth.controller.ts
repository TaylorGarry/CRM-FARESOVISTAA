import { Request, Response } from 'express';
import { User } from '../models/Auth/User.model';
import { AdminSetting } from '../models/Auth/AdminSetting.model';
import { Role } from '../models/Auth/Role.model';
import { env } from '../config/env';
import { generateToken, getCurrentTimestamp, verifyToken } from '../services/token.service';
import { createUserHistory, updateUserHistoryLogout, getActiveBreak, disableBreak } from '../services/history.service';
import { AuthRequest } from '../types';
import { hashPassword, isHashedPassword, verifyPassword } from '../utils/password';
import { isAdminRequest } from '../middleware/admin.middleware';


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uname, password } = req.body;

    // PHP: if(!empty($uname) or !empty($pass))
    if (!uname || !password) {
      res.redirect('/login?stat=Invalid username or password');
      return;
    }

    // PHP: if($uname=='admin')
    if (uname === env.ADMIN_USERNAME) {
      // PHP: checklogin($conn, $uname, $pass, 'tbl_settings')
      const admin = await AdminSetting.findOne({
        username: uname,
        id: 1
      }).select('+pass_real');

      if (admin && await verifyPassword(password, admin.pass_real)) {
        if (!isHashedPassword(admin.pass_real)) {
          await AdminSetting.updateOne(
            { id: admin.id },
            {
              pass_real: await hashPassword(password),
              Password: await hashPassword(password)
            }
          );
        }

        // PHP: $_SESSION['last_login'] = date(' dS F Y  H:i', $time_now)
        const timeNow = getCurrentTimestamp();
        
        // Create user history
        const uhistId = await createUserHistory({
          uhist_userid: 0,
          uhist_udept: 'Admin'
        });

        // Generate JWT token
        const token = generateToken({
          user_id: 0,
          user_login: uname,
          user_name: 'Admin', 
          user_role: 'Admin',
          isAdmin: true,
          uhist_id: uhistId
        });

        res.json({
          success: true,
          token,
          redirect: '/dashboard',
          user: {
            user_id: 0,
            user_login: uname,
            user_role: 'Admin',
            isAdmin: true,
            last_login: timeNow
          }
        });
        return;
      } else {
        res.redirect('/login?stat=Invalid username or password');
        return;
      }
    }

    // PHP: Regular User - checklogin_utype($conn, $uname, $pass, 'tbl_users')
    const user = await User.findOne({
      user_login: uname,
      user_status: 'Enabled',
      delete_status: 'False'
    }).select('+user_password');

    if (user && await verifyPassword(password, user.user_password)) {
      const roleId = Number(user.user_role);
      const assignedRole = Number.isInteger(roleId)
        ? await Role.findOne({
            role_id: roleId,
            delete_status: { $ne: 'True' }
          }).select('role_name')
        : null;
      const isAdmin = user.user_role.trim().toLowerCase() === 'admin'
        || assignedRole?.role_name.trim().toLowerCase() === 'admin';

      if (!isHashedPassword(user.user_password)) {
        await User.updateOne(
          { user_id: user.user_id },
          { user_password: await hashPassword(password) }
        );
      }

      // PHP: $_SESSION['last_login'] = date(' dS F Y  H:i', $time_now)
      const timeNow = getCurrentTimestamp();

      // Create user history
      const uhistId = await createUserHistory({
        uhist_userid: user.user_id,
        uhist_udept: user.user_role
      });

      // Generate JWT token
      const token = generateToken({
        user_id: user.user_id,
        user_login: user.user_login,
        user_name: user.user_name,
        user_role: user.user_role,
        isAdmin,
        uhist_id: uhistId
      });

      res.json({
        success: true,
        token,
        redirect: '/dashboard',
        user: {
          user_id: user.user_id,
          user_login: user.user_login,
          user_role: user.user_role,
          user_name: user.user_name,
          isAdmin,
          last_login: timeNow
        }
      });
      return;
    } else {
      res.redirect('/login?stat=Invalid username or password');
      return;
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { user_id, user_role, uhist_id } = req.body;

    // PHP: Update user history logout time
    // PHP: $data = array('uhist_logouttime' => date('dS F Y  H:i', $time_now))
    // PHP: update($conn, "tbl_userhistory", $data, "where uhist_id = '". $_SESSION['uhist_id']."'")
    if (uhist_id) {
      await updateUserHistoryLogout(uhist_id);
    }

    // PHP: For non-admin, disable active break
    if (user_role !== 'Admin') {
      const activeBreak = await getActiveBreak(user_id);
      if (activeBreak) {
        await disableBreak(activeBreak.break_details_id, user_id);
      }
    }

    // PHP: session_destroy()
    res.json({
      success: true,
      redirect: '/login'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

export const checkSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      res.status(401).json({ success: false, message: 'No session' });
      return;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({ success: false, message: 'Invalid session' });
      return;
    }

    // PHP: Check session timeout
    const lastActivity = req.headers['x-last-activity'];
    if (lastActivity) {
      const timeSince = Date.now() - parseInt(lastActivity as string);
      if (timeSince > env.SESSION_TIMEOUT * 1000) {
        res.status(401).json({ 
          success: false, 
          message: 'Session expired',
          redirect: '/login'
        });
        return;
      }
    }

    res.json({
      success: true,
      user: {
        user_id: decoded.user_id,
        user_login: decoded.user_login,
        user_role: decoded.user_role,
        isAdmin: decoded.isAdmin
      }
    });

  } catch (error) {
    console.error('Session check error:', error);
    res.status(500).json({ success: false, message: 'Session check failed' });
  }
};


export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      user_login,
      user_password,
      user_email,
      user_name,
      user_role,
      user_status,
      delete_status,
      gender,
      user_gender,
      dob,
      user_dob,
      mobile,
      address,
      webmail_password
    } = req.body;

    if (user_password && !isAdminRequest(req)) {
      res.status(403).json({ success: false, message: 'Only administrators can set user passwords' });
      return;
    }

    const normalizedGender = gender || user_gender;
    const normalizedDob = dob || user_dob;
    if (!user_login || !user_password || !user_email || !user_name || !normalizedGender) {
      res.status(400).json({ success: false, message: 'Name, username, email, gender and password are required' });
      return;
    }

    // PHP: Check if user already exists
    // $check = mysqli_query($conn, "SELECT * FROM tbl_users WHERE user_login = '$user_login' OR user_email = '$user_email'");
    const existingUser = await User.findOne({
      $or: [
        { user_login: user_login },
        { user_email: user_email }
      ]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: 'Username or email already exists'
      });
      return;
    }

    // PHP: Insert new user
    // $data = array(
    //   'user_login' => $user_login,
    //   'user_password' => $user_password,
    //   'user_email' => $user_email,
    //   'user_name' => $user_name,
    //   'user_role' => $user_role,
    //   'user_status' => 'Enabled',
    //   'delete_status' => 'False'
    // );
    // insert($conn, 'tbl_users', $data);

    const newUser = new User({
      user_login,
      user_password, // Plain text like PHP (will be hashed in production)
      user_email,
      user_name,
      user_role: user_role || 'User',
      gender: normalizedGender,
      user_gender: normalizedGender,
      dob: normalizedDob,
      user_dob: normalizedDob,
      mobile, address, webmail_password,
      user_status: user_status || 'Enabled',
      delete_status: delete_status || 'False',
      code: '',
      forgot_date: null,
      add_by: req.user?.user_login || 'system'
    });

    await newUser.save();

    // PHP: Return success
    // header('Location: users.php?msg=User created successfully');
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        user_id: newUser.user_id,
        user_login: newUser.user_login,
        user_email: newUser.user_email,
        user_name: newUser.user_name,
        user_role: newUser.user_role,
        user_status: newUser.user_status,
        delete_status: newUser.delete_status,
        created_at: newUser.created_at
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};


export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // PHP: $sql = mysqli_query($conn, "SELECT * FROM tbl_users WHERE delete_status='False'");
    const userQuery = User.find({ delete_status: 'False' });
    const users = await userQuery.select('-user_password -__v');

    res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
};


export const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // PHP: $sql = mysqli_query($conn, "SELECT * FROM tbl_users WHERE user_id = '$id'");
    const user = await User.findOne({
      user_id: parseInt(id as string, 10),
      delete_status: 'False'
    }).select('-user_password -__v');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user'
    });
  }
};


export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      user_login,
      user_password,
      user_email,
      user_name,
      user_role,
      user_status,
      delete_status,
      gender,
      user_gender,
      dob,
      user_dob,
      mobile,
      address,
      webmail_password
    } = req.body;

    if (user_password && !isAdminRequest(req)) {
      res.status(403).json({ success: false, message: 'Only administrators can change user passwords' });
      return;
    }

    // PHP: Check if user exists
    // $sql = mysqli_query($conn, "SELECT * FROM tbl_users WHERE user_id = '$id'");
    const user = await User.findOne({
      user_id: parseInt(id as string, 10),
      delete_status: 'False'
    });

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    // PHP: Check for duplicate username/email
    if (user_login || user_email) {
      const existingUser = await User.findOne({
        $and: [
          { user_id: { $ne: parseInt(id as string, 10) } },
          {
            $or: [
              { user_login: user_login },
              { user_email: user_email }
            ]
          }
        ]
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          message: 'Username or email already exists'
        });
        return;
      }
    }

    // PHP: $data = array(...); update($conn, 'tbl_users', $data, "where user_id = $id");
    const updateData: any = {};
    if (user_login) updateData.user_login = user_login;
    if (user_password) updateData.user_password = user_password;
    if (user_email) updateData.user_email = user_email;
    if (user_name) updateData.user_name = user_name;
    if (user_role) updateData.user_role = user_role;
    if (user_status) updateData.user_status = user_status;
    if (delete_status) updateData.delete_status = delete_status;
    const normalizedGender = gender || user_gender;
    if (normalizedGender) {
      updateData.gender = normalizedGender;
      updateData.user_gender = normalizedGender;
    }
    const normalizedDob = dob || user_dob;
    if (normalizedDob !== undefined) {
      updateData.dob = normalizedDob;
      updateData.user_dob = normalizedDob;
    }
    if (mobile !== undefined) updateData.mobile = mobile;
    if (address !== undefined) updateData.address = address;
    if (webmail_password) updateData.webmail_password = webmail_password;
    updateData.update_by = req.user?.user_login || 'system';

    const updatedUser = await User.findOneAndUpdate(
      { user_id: parseInt(id as string, 10) },
      updateData,
      { new: true }
    ).select('-user_password -__v');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // PHP: Soft delete - update delete_status = 'True'
    // $data = array('delete_status' => 'True'); update($conn, 'tbl_users', $data, "where user_id = $id");
    const user = await User.findOneAndUpdate(
      { user_id: parseInt(id as string, 10), delete_status: 'False' },
      { delete_status: 'True', delete_by: req.user?.user_login || 'system', delete_date: new Date() },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found or already deleted'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        user_id: user.user_id,
        user_login: user.user_login,
        delete_status: user.delete_status
      }
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Enabled', 'Disabled'].includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "Enabled" or "Disabled"'
      });
      return;
    }

    // PHP: $data = array('user_status' => $status); update($conn, 'tbl_users', $data, "where user_id = $id");
    const user = await User.findOneAndUpdate(
      { user_id: parseInt(id as string, 10), delete_status: 'False' },
      { user_status: status, update_by: req.user?.user_login || 'system' },
      { new: true }
    ).select('-__v');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `User ${status === 'Enabled' ? 'enabled' : 'disabled'} successfully`,
      data: user
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status'
    });
  }
};

export const getActiveUsers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await User.find({
      user_status: 'Enabled',
      delete_status: 'False',
    })
      .select('user_id user_login user_name user_email user_role')
      .sort({ user_name: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: users,
      count: users.length,
    });
  } catch (error) {
    console.error('Get active users error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch active users',
    });
  }
};