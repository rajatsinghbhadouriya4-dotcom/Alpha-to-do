import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { adminAPI } from '../lib/api';
import { supabase } from '../lib/supabase';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Building2,
  HeartPulse,
  Ambulance,
  Plus,
  Minus,
  Lock,
  ArrowRight,
  Loader2,
  Check,
  Clock,
  Sparkles,
  Phone,
  Mail,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export default function AdminView() {
  const { authUser, navigate, hospitals, setHospitals, refreshHospitals } = useApp();

  // Active admin tab: 'users' | 'hospitals'
  const [activeTab, setActiveTab] = useState('users');

  // Metrics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    deactivatedUsers: 0,
    newRegistrationsLast7Days: 0,
  });

  // User Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');
  const [actionErrorMsg, setActionErrorMsg] = useState('');

  // Modals State
  const [viewUser, setViewUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserCandidate, setDeleteUserCandidate] = useState(null);
  const [submittingAction, setSubmittingAction] = useState(false);

  // Hospital Capacity State (Tab 2)
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id);
  const [savingHosp, setSavingHosp] = useState(false);
  const [hospSuccessMsg, setHospSuccessMsg] = useState('');

  // 1. Fetch Admin Statistics and Users
  const fetchAdminData = useCallback(async () => {
    if (!authUser || authUser.role !== 'admin') return;

    setLoadingUsers(true);
    setActionErrorMsg('');

    try {
      // Parallel fetch stats & users
      const [statsRes, usersRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers({
          search: searchQuery,
          role: roleFilter,
          status: statusFilter,
        }),
      ]);

      if (statsRes?.stats) {
        setStats(statsRes.stats);
      }

      if (usersRes?.users) {
        setUsers(usersRes.users);
      }
    } catch (err) {
      console.error('Failed loading admin data:', err);
      setActionErrorMsg(err.message || 'Failed to communicate with admin API.');
    } finally {
      setLoadingUsers(false);
    }
  }, [authUser, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Status message auto-clear
  useEffect(() => {
    if (actionSuccessMsg) {
      const timer = setTimeout(() => setActionSuccessMsg(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccessMsg]);

  // 2. Toggle User Status
  async function handleToggleStatus(user) {
    if (user.id === authUser.id) {
      setActionErrorMsg('You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = user.status === 'active' ? 'deactivated' : 'active';
    setSubmittingAction(true);
    setActionErrorMsg('');

    try {
      await adminAPI.updateStatus(user.id, nextStatus);
      setActionSuccessMsg(`User ${user.full_name} status updated to ${nextStatus}.`);
      await fetchAdminData();
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to update user status.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // 3. Save User Edit (Name, Mobile, Role)
  async function handleSaveUserEdit(e) {
    e.preventDefault();
    if (!editUser) return;

    setSubmittingAction(true);
    setActionErrorMsg('');

    try {
      await adminAPI.updateUser(editUser.id, {
        full_name: editUser.full_name,
        mobile: editUser.mobile,
        role: editUser.role,
        status: editUser.status,
      });

      setActionSuccessMsg(`User ${editUser.full_name} updated successfully.`);
      setEditUser(null);
      await fetchAdminData();
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to update user details.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // 4. Confirm Delete User
  async function handleConfirmDelete() {
    if (!deleteUserCandidate) return;

    if (deleteUserCandidate.id === authUser.id) {
      setActionErrorMsg('You cannot delete your own administrative account.');
      setDeleteUserCandidate(null);
      return;
    }

    setSubmittingAction(true);
    setActionErrorMsg('');

    try {
      await adminAPI.deleteUser(deleteUserCandidate.id);
      setActionSuccessMsg(`User ${deleteUserCandidate.email} has been permanently deleted.`);
      setDeleteUserCandidate(null);
      await fetchAdminData();
    } catch (err) {
      setActionErrorMsg(err.message || 'Failed to delete user.');
    } finally {
      setSubmittingAction(false);
    }
  }

  // 5. Hospital Capacity Controls (Tab 2)
  const currentHospital = hospitals.find(h => h.id === selectedHospitalId) || hospitals[0];
  const beds = currentHospital?.beds || {};

  function updateLocalBedCount(field, delta) {
    if (!currentHospital) return;
    const currentVal = beds[field] || 0;
    const newVal = Math.max(0, currentVal + delta);

    setHospitals(prev =>
      prev.map(h => {
        if (h.id === currentHospital.id) {
          return {
            ...h,
            last_updated: new Date().toISOString(),
            beds: {
              ...h.beds,
              [field]: newVal,
            },
          };
        }
        return h;
      })
    );
  }

  function updateEmergencyStatus(status) {
    if (!currentHospital) return;
    setHospitals(prev =>
      prev.map(h => {
        if (h.id === currentHospital.id) {
          return {
            ...h,
            emergency_status: status,
            last_updated: new Date().toISOString(),
          };
        }
        return h;
      })
    );
  }

  async function handleSaveHospitalChanges() {
    if (!currentHospital) return;
    setSavingHosp(true);
    setHospSuccessMsg('');

    try {
      const now = new Date().toISOString();
      await supabase
        .from('hospitals')
        .update({
          emergency_status: currentHospital.emergency_status,
          last_updated: now,
        })
        .eq('id', currentHospital.id);

      if (beds.id) {
        await supabase
          .from('beds')
          .update({
            general_available: beds.general_available,
            icu_available: beds.icu_available,
            emergency_available: beds.emergency_available,
            ventilator_available: beds.ventilator_available,
            oxygen_available: beds.oxygen_available,
            last_updated: now,
          })
          .eq('id', beds.id);
      }

      setHospSuccessMsg('Hospital capacity synchronized successfully!');
      setTimeout(() => setHospSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed saving hospital capacity:', err);
    } finally {
      setSavingHosp(false);
    }
  }

  // ==========================================
  // ACCESS CONTROL GATE (If not Admin)
  // ==========================================
  if (!authUser || authUser.role !== 'admin') {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xl shadow-slate-200/50 space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700">
            <Lock className="h-7 w-7" />
          </div>
          <div>
            <span className="rounded-full bg-purple-100 px-3 py-1 text-[11px] font-bold text-purple-800 uppercase tracking-wide">
              Restricted Area
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              Administrator Access Required
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              You must be signed in with an administrative account (<code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700 font-mono">role: admin</code>) to view metrics and manage registered users.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => navigate('signin')}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-colors"
            >
              <span>Sign In as Admin</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate('home')}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-8">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300 ring-1 ring-purple-500/40">
                <Shield className="h-3.5 w-3.5" />
                Administrative Control Center
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Connected to Supabase PostgreSQL
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              EmergencyCare <span className="text-purple-400">Admin Portal</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Monitor real-time system metrics, manage user roles, toggle account statuses, and coordinate hospital bed capacities.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-purple-500/30 shadow-inner">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              User Control
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'hospitals'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Hospital Capacities
            </button>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {actionSuccessMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 animate-in fade-in">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {actionErrorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-900 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span>{actionErrorMsg}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: USER MANAGEMENT & ROLE CONTROL                     */}
      {/* ======================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Total Users */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Users</span>
                <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-slate-900">{stats.totalUsers}</div>
              <div className="text-[11px] text-slate-400 mt-1">All registered system accounts</div>
            </div>

            {/* Active Users */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-emerald-600">{stats.activeUsers}</div>
              <div className="text-[11px] text-slate-400 mt-1">Authorized for emergency booking</div>
            </div>

            {/* Inactive / Deactivated */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Deactivated Users</span>
                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
                  <UserX className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-rose-600">{stats.deactivatedUsers}</div>
              <div className="text-[11px] text-slate-400 mt-1">Login blocked by administrator</div>
            </div>

            {/* New Registrations (7 Days) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">New (Last 7 Days)</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-3 text-2xl font-black text-blue-600">{stats.newRegistrationsLast7Days}</div>
              <div className="text-[11px] text-slate-400 mt-1">Recent platform onboarding</div>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, or mobile..."
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Role Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-semibold hidden sm:inline">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="font-semibold hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="deactivated">Deactivated</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={fetchAdminData}
                disabled={loadingUsers}
                className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                title="Refresh Table"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* User Management Table */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">User ID</th>
                    <th className="py-3.5 px-4">Full Name</th>
                    <th className="py-3.5 px-4">Email Address</th>
                    <th className="py-3.5 px-4">Mobile</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Account Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingUsers ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                          <span>Loading registered users from Supabase...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        No users found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    users.map(u => {
                      const isSelf = u.id === authUser.id;
                      const isAdmin = u.role === 'admin';
                      const isActive = u.status === 'active';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* ID */}
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            <span title={u.id}>{u.id.substring(0, 8)}...</span>
                          </td>

                          {/* Full Name */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {u.full_name}
                              {isSelf && (
                                <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[9px] font-bold text-purple-800">
                                  You
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Email */}
                          <td className="py-3 px-4 text-slate-700">{u.email}</td>

                          {/* Mobile */}
                          <td className="py-3 px-4 text-slate-600">{u.mobile || '—'}</td>

                          {/* Role */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                isAdmin
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : 'bg-blue-100 text-blue-800 border border-blue-200'
                              }`}
                            >
                              {isAdmin && <Shield className="h-3 w-3" />}
                              {u.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isActive ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              ></span>
                              {u.status}
                            </span>
                          </td>

                          {/* Created Date */}
                          <td className="py-3 px-4 text-slate-500 text-[11px]">
                            {new Date(u.created_at).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              
                              {/* View Details */}
                              <button
                                onClick={() => setViewUser(u)}
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                                title="View User Details"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>

                              {/* Edit User */}
                              <button
                                onClick={() => setEditUser({ ...u })}
                                className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Edit User Information"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>

                              {/* Toggle Status (Active / Deactivate) */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={isSelf || submittingAction}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  isActive
                                    ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                                    : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                                } disabled:opacity-30 disabled:cursor-not-allowed`}
                                title={
                                  isSelf
                                    ? 'Cannot deactivate yourself'
                                    : isActive
                                    ? 'Deactivate User'
                                    : 'Activate User'
                                }
                              >
                                {isActive ? (
                                  <UserX className="h-3.5 w-3.5" />
                                ) : (
                                  <UserCheck className="h-3.5 w-3.5" />
                                )}
                              </button>

                              {/* Delete User */}
                              <button
                                onClick={() => setDeleteUserCandidate(u)}
                                disabled={isSelf || submittingAction}
                                className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                title={isSelf ? 'Cannot delete yourself' : 'Delete User Permanently'}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: HOSPITAL & BED CAPACITY MANAGEMENT                 */}
      {/* ======================================================== */}
      {activeTab === 'hospitals' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            
            {/* Hospital Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  Live Hospital Bed & Emergency Triage Synchronizer
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update live ICU, oxygen, and emergency capacities reflecting in real-time on patient decision cards.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none"
                >
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.emergency_status?.toUpperCase()})
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleSaveHospitalChanges}
                  disabled={savingHosp}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {savingHosp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save Capacity</span>
                </button>
              </div>
            </div>

            {hospSuccessMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>{hospSuccessMsg}</span>
              </div>
            )}

            {/* Emergency Status Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Hospital Emergency Department Status
              </label>
              <div className="flex flex-wrap gap-3">
                {['open', 'busy', 'critical', 'full'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => updateEmergencyStatus(st)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                      currentHospital.emergency_status === st
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Bed Capacities Counter */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              {/* ICU Beds */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-700">ICU Available Beds</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-purple-700">{beds.icu_available ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateLocalBedCount('icu_available', -1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => updateLocalBedCount('icu_available', 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Emergency Beds */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-700">Emergency / Trauma Beds</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-rose-700">{beds.emergency_available ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateLocalBedCount('emergency_available', -1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => updateLocalBedCount('emergency_available', 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Ventilators */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="text-xs font-bold text-slate-700">Ventilators Functional</div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-blue-700">{beds.ventilator_available ?? 0}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateLocalBedCount('ventilator_available', -1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => updateLocalBedCount('ventilator_available', 1)}
                      className="p-1.5 rounded-lg bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: VIEW USER DETAILS                               */}
      {/* ======================================================== */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-600" />
                User Account Profile
              </h3>
              <button
                onClick={() => setViewUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <div className="text-[11px] text-slate-400">Database Record ID</div>
                <div className="font-mono text-slate-800 break-all">{viewUser.id}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-[11px] text-slate-400">Full Name</div>
                  <div className="font-bold text-slate-900 text-sm">{viewUser.full_name}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-[11px] text-slate-400">Assigned Role</div>
                  <div className="font-bold uppercase text-purple-700">{viewUser.role}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <div className="text-[11px] text-slate-400">Email Address</div>
                <div className="font-semibold text-slate-800">{viewUser.email}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-[11px] text-slate-400">Mobile Number</div>
                  <div className="font-semibold text-slate-800">{viewUser.mobile || '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                  <div className="text-[11px] text-slate-400">Account Status</div>
                  <div className={`font-bold ${viewUser.status === 'active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {viewUser.status?.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 space-y-1">
                <div className="text-[11px] text-slate-400">Registration Timestamp</div>
                <div className="text-slate-700">{new Date(viewUser.created_at).toLocaleString('en-IN')}</div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewUser(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: EDIT USER DETAILS                               */}
      {/* ======================================================== */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-4 w-4 text-blue-600" />
                Edit User Details
              </h3>
              <button
                onClick={() => setEditUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  value={editUser.mobile || ''}
                  onChange={(e) => setEditUser({ ...editUser, mobile: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Role</label>
                  <select
                    value={editUser.role}
                    disabled={editUser.id === authUser.id}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Account Status</label>
                  <select
                    value={editUser.status}
                    disabled={editUser.id === authUser.id}
                    onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-purple-500 focus:outline-none disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                  </select>
                </div>
              </div>

              {editUser.id === authUser.id && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  Role and status changes are disabled on your active administrative account.
                </div>
              )}

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex items-center gap-1.5 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {submittingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION DIALOG                      */}
      {/* ======================================================== */}
      {deleteUserCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-base">Confirm Permanent Deletion</h3>
              <p className="mt-1 text-xs text-slate-500">
                Are you sure you want to permanently delete user account{' '}
                <strong className="text-slate-800">{deleteUserCandidate.email}</strong>?
                This action is irreversible.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteUserCandidate(null)}
                className="w-1/2 rounded-xl bg-slate-100 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submittingAction}
                className="w-1/2 flex items-center justify-center gap-1.5 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md shadow-red-600/30 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {submittingAction ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
