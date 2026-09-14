import { Response } from 'express';
import { AuthRequest } from '../types';
import { Role } from '../models/Auth/Role.model';
import { RolePermission } from '../models/Auth/RolePermission.model';
import { Module } from '../models/Auth/Module.model';
import { Submodule } from '../models/Auth/Submodule.model';

const actor = (req: AuthRequest) => req.user?.user_login || 'system';
const id = (value: string) => Number.parseInt(value, 10);

export const listRoles = async (_req: AuthRequest, res: Response) => {
  // Include older records that were inserted without the default delete_status field.
  const roles = await Role.find({ delete_status: { $ne: 'True' } }).sort({ role_name: 1 }).select('-__v');
  const data = roles.map(role => {
    const value = role.toObject() as unknown as Record<string, unknown>;
    return {
      ...value,
      status: value.status || value.role_status || 'Enabled',
      delete_status: value.delete_status || 'False'
    };
  });
  res.json({ success: true, data });
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleName = String(req.body.role_name || '').trim();
    const departmentRole = String(req.body.department_role || '').trim();
    const status = req.body.status || 'Enabled';
    if (!roleName || !departmentRole) return res.status(400).json({ success: false, message: 'Role name and department role are required' });
    const duplicate = await Role.findOne({ delete_status: { $ne: 'True' }, role_name: roleName });
    if (duplicate) return res.status(400).json({ success: false, message: 'Role name already exists' });
    const role = await Role.create({ role_name: roleName, department_role: departmentRole, status, add_by: actor(req) });
    res.status(201).json({ success: true, message: 'Role created successfully', data: role });
  } catch (error) { res.status(500).json({ success: false, message: 'Failed to create role' }); }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const roleId = id(String(req.params.id));
    if (!Number.isInteger(roleId)) return res.status(400).json({ success: false, message: 'Invalid role id' });

    const roleName = String(req.body.role_name || '').trim();
    const departmentRole = String(req.body.department_role || '').trim();
    const status = req.body.status;
    if (!roleName || !departmentRole) return res.status(400).json({ success: false, message: 'Role name and department role are required' });

    const currentRole = await Role.findOne({ role_id: roleId, delete_status: 'False' }).select('role_name department_role');
    if (!currentRole) return res.status(404).json({ success: false, message: 'Role not found' });

    // Exclude the record being edited; unchanged values must not trigger a duplicate error.
    const duplicate = await Role.findOne({
      _id: { $ne: currentRole._id },
      delete_status: { $ne: 'True' },
      role_name: roleName
    });
    if (duplicate) return res.status(400).json({ success: false, message: 'Role name already exists' });
    const role = await Role.findOneAndUpdate({ role_id: roleId, delete_status: 'False' }, { role_name: roleName, department_role: departmentRole, status, update_by: actor(req) }, { new: true, runValidators: true });
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, message: 'Role updated successfully', data: role });
  } catch { res.status(500).json({ success: false, message: 'Failed to update role' }); }
};

export const toggleRoleStatus = async (req: AuthRequest, res: Response) => {
  if (!['Enabled', 'Disabled'].includes(req.body.status)) return res.status(400).json({ success: false, message: 'Invalid role status' });
  const role = await Role.findOneAndUpdate({ role_id: id(String(req.params.id)), delete_status: 'False' }, { status: req.body.status, update_by: actor(req) }, { new: true });
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  res.json({ success: true, message: 'Role status updated', data: role });
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  const role = await Role.findOneAndUpdate({ role_id: id(String(req.params.id)), delete_status: 'False' }, { delete_status: 'True', delete_by: actor(req), delete_date: new Date() }, { new: true });
  if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
  res.json({ success: true, message: 'Role deleted successfully' });
};

export const listModules = async (_req: AuthRequest, res: Response) => {
  const modules = await Module.find({ status: 'Enabled' }).sort({ id: 1 }).select('-__v');
  res.json({ success: true, data: modules });
};

export const listSubmodules = async (req: AuthRequest, res: Response) => {
  const filter: Record<string, unknown> = { sub_status: 'Enabled' };
  if (req.query.moduleId) filter.sub_mainid = id(String(req.query.moduleId));
  const submodules = await Submodule.find(filter).sort({ sub_id: 1 }).select('-__v');
  res.json({ success: true, data: submodules });
};

export const listPermissions = async (_req: AuthRequest, res: Response) => {
  const permissions = await RolePermission.find({ delete_status: 'False' }).select('-__v');
  res.json({ success: true, data: permissions });
};

export const savePermission = async (req: AuthRequest, res: Response) => {
  try {
    const { roleper_roleid, roleper_mainmenu = [], roleper_submenu = [], roleper_status = 'Enabled', dashboardPer = false, mcoReport = false } = req.body;
    if (!roleper_roleid) return res.status(400).json({ success: false, message: 'Role is required' });
    const existing = await RolePermission.findOne({ roleper_roleid, delete_status: 'False' });
    const data = { roleper_mainmenu, roleper_submenu, roleper_status, dashboardPer, mcoReport, update_by: actor(req), ...(existing ? {} : { add_by: actor(req) }) };
    const permission = existing ? await RolePermission.findByIdAndUpdate(existing._id, data, { new: true }) : await RolePermission.create({ roleper_roleid, ...data });
    res.status(existing ? 200 : 201).json({ success: true, message: 'Permissions saved successfully', data: permission });
  } catch { res.status(500).json({ success: false, message: 'Failed to save permissions' }); }
};
