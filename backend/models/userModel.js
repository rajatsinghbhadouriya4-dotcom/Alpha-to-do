import supabase from '../config/db.js';

/**
 * User Model - Data Access Layer for public.users
 */
export const UserModel = {
  /**
   * Find a user by email address (used during login/signup checks)
   * @param {string} email
   * @returns {Promise<object|null>}
   */
  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('email', cleanEmail)
      .maybeSingle();

    if (error) {
      console.error('[UserModel.findByEmail] error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Find a user by UUID id
   * @param {string} id
   * @param {boolean} includePassword
   * @returns {Promise<object|null>}
   */
  async findById(id, includePassword = false) {
    if (!id) return null;
    const selectFields = includePassword
      ? '*'
      : 'id, full_name, email, mobile, role, status, created_at, updated_at';

    const { data, error } = await supabase
      .from('users')
      .select(selectFields)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('[UserModel.findById] error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Create a new user with hashed password
   * @param {object} userData
   * @returns {Promise<object>}
   */
  async create({ full_name, email, mobile, password_hash, role = 'user', status = 'active' }) {
    const cleanEmail = email.trim().toLowerCase();
    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name: full_name.trim(),
        email: cleanEmail,
        mobile: mobile ? mobile.trim() : null,
        password_hash,
        role: role || 'user',
        status: status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, full_name, email, mobile, role, status, created_at, updated_at')
      .single();

    if (error) {
      console.error('[UserModel.create] error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Find all users with search, role, status filters, and pagination
   * @param {object} options
   * @returns {Promise<{ users: Array, total: number }>}
   */
  async findAll({ search = '', role = '', status = '', page = 1, limit = 50 } = {}) {
    let query = supabase
      .from('users')
      .select('id, full_name, email, mobile, role, status, created_at, updated_at', { count: 'exact' });

    if (role && role !== 'all') {
      query = query.eq('role', role);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search && search.trim()) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%`);
    }

    const offset = (Math.max(1, page) - 1) * limit;
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('[UserModel.findAll] error:', error);
      throw error;
    }

    return {
      users: data || [],
      total: count || 0,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Update user details
   * @param {string} id
   * @param {object} updates
   * @returns {Promise<object>}
   */
  async update(id, updates) {
    const safeUpdates = {
      updated_at: new Date().toISOString(),
    };

    if (updates.full_name !== undefined) safeUpdates.full_name = updates.full_name.trim();
    if (updates.mobile !== undefined) safeUpdates.mobile = updates.mobile ? updates.mobile.trim() : null;
    if (updates.role !== undefined) safeUpdates.role = updates.role;
    if (updates.status !== undefined) safeUpdates.status = updates.status;

    const { data, error } = await supabase
      .from('users')
      .update(safeUpdates)
      .eq('id', id)
      .select('id, full_name, email, mobile, role, status, created_at, updated_at')
      .single();

    if (error) {
      console.error('[UserModel.update] error:', error);
      throw error;
    }
    return data;
  },

  /**
   * Toggle or update user account status ('active' | 'deactivated')
   * @param {string} id
   * @param {string} status
   * @returns {Promise<object>}
   */
  async updateStatus(id, status) {
    if (!['active', 'deactivated'].includes(status)) {
      throw new Error("Invalid status. Allowed values are 'active' or 'deactivated'.");
    }
    return this.update(id, { status });
  },

  /**
   * Update user role ('user' | 'admin')
   * @param {string} id
   * @param {string} role
   * @returns {Promise<object>}
   */
  async updateRole(id, role) {
    if (!['user', 'admin'].includes(role)) {
      throw new Error("Invalid role. Allowed values are 'user' or 'admin'.");
    }
    return this.update(id, { role });
  },

  /**
   * Delete a user by id
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[UserModel.delete] error:', error);
      throw error;
    }
    return true;
  },

  /**
   * Calculate summary metrics for the Admin Dashboard
   * @returns {Promise<object>}
   */
  async getStats() {
    const { data: allUsers, error } = await supabase
      .from('users')
      .select('id, role, status, created_at');

    if (error) {
      console.error('[UserModel.getStats] error:', error);
      throw error;
    }

    const total = allUsers.length;
    const active = allUsers.filter(u => u.status === 'active').length;
    const deactivated = allUsers.filter(u => u.status === 'deactivated').length;
    const admins = allUsers.filter(u => u.role === 'admin').length;
    const normalUsers = allUsers.filter(u => u.role === 'user').length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newLast7Days = allUsers.filter(u => new Date(u.created_at) >= sevenDaysAgo).length;

    return {
      totalUsers: total,
      activeUsers: active,
      deactivatedUsers: deactivated,
      adminUsers: admins,
      normalUsers,
      newRegistrationsLast7Days: newLast7Days,
    };
  },
};

export default UserModel;
