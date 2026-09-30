import UserModel from '../models/userModel.js';

/**
 * Controller: Get Admin Dashboard Statistics
 * GET /api/admin/stats
 */
export async function getDashboardStats(req, res) {
  try {
    const stats = await UserModel.getStats();
    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (err) {
    console.error('[adminController.getDashboardStats] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard metrics.',
    });
  }
}

/**
 * Controller: Get all users with search, role, status filtering, and pagination
 * GET /api/admin/users
 */
export async function getAllUsers(req, res) {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 50 } = req.query;

    const result = await UserModel.findAll({
      search,
      role,
      status,
      page: Number(page) || 1,
      limit: Number(limit) || 50,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err) {
    console.error('[adminController.getAllUsers] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve users list.',
    });
  }
}

/**
 * Controller: Get user details by ID
 * GET /api/admin/users/:id
 */
export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id, false);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    console.error('[adminController.getUserById] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve user details.',
    });
  }
}

/**
 * Controller: Update user details (name, mobile, role, status)
 * PUT /api/admin/users/:id
 */
export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { full_name, mobile, role, status } = req.body;

    const existing = await UserModel.findById(id, false);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    // Protect against self-lockout
    if (req.user.id === id && status === 'deactivated') {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own administrative account.',
      });
    }

    if (req.user.id === id && role && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot remove your own administrator privileges.',
      });
    }

    const updated = await UserModel.update(id, {
      full_name,
      mobile,
      role,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: updated,
    });
  } catch (err) {
    console.error('[adminController.updateUser] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user.',
    });
  }
}

/**
 * Controller: Toggle user account status (active <-> deactivated)
 * PATCH /api/admin/users/:id/status
 */
export async function updateUserStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'deactivated'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be either 'active' or 'deactivated'.",
      });
    }

    if (req.user.id === id && status === 'deactivated') {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own administrative account.',
      });
    }

    const updated = await UserModel.updateStatus(id, status);

    return res.status(200).json({
      success: true,
      message: `User status changed to ${status}.`,
      user: updated,
    });
  } catch (err) {
    console.error('[adminController.updateUserStatus] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user status.',
    });
  }
}

/**
 * Controller: Update user role (user <-> admin)
 * PATCH /api/admin/users/:id/role
 */
export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: "Role must be either 'user' or 'admin'.",
      });
    }

    if (req.user.id === id && role !== 'admin') {
      return res.status(400).json({
        success: false,
        error: 'You cannot revoke your own administrator privileges.',
      });
    }

    const updated = await UserModel.updateRole(id, role);

    return res.status(200).json({
      success: true,
      message: `User role changed to ${role}.`,
      user: updated,
    });
  } catch (err) {
    console.error('[adminController.updateUserRole] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user role.',
    });
  }
}

/**
 * Controller: Delete user by ID
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot delete your own administrative account.',
      });
    }

    const existing = await UserModel.findById(id, false);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'User not found.',
      });
    }

    await UserModel.delete(id);

    return res.status(200).json({
      success: true,
      message: `User account (${existing.email}) has been permanently deleted.`,
    });
  } catch (err) {
    console.error('[adminController.deleteUser] Error:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete user account.',
    });
  }
}

export default {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  updateUserRole,
  deleteUser,
};
