import { getHospitalsFromDb } from './src/lib/supabase.js';
import { calculateBookingEstimate } from './src/lib/pricingData.js';
import { calculateDistance, estimateTravelTime } from './src/lib/geoUtils.js';

async function runComprehensiveTest() {
  console.log('====================================================');
  console.log('🚑 RUNNING FULL-STACK TEST (FRONTEND + BACKEND)');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
      failed++;
    }
  }

  // --- PART 1: SERVER CONNECTIVITY ---
  console.log('--- 1. SERVER HEALTH & CONNECTIVITY ---');
  try {
    const fRes = await fetch('http://localhost:5173/');
    assert(fRes.status === 200, 'Frontend Vite dev server is running on http://localhost:5173');

    const bRes = await fetch('http://localhost:5000/api/health');
    const bData = await bRes.json();
    assert(bRes.status === 200 && bData.status === 'healthy', 'Backend Express API is healthy on http://localhost:5000/api/health');
  } catch (err) {
    assert(false, `Connectivity error: ${err.message}`);
  }

  // --- PART 2: AUTHENTICATION FLOWS ---
  console.log('\n--- 2. AUTHENTICATION (JWT + BCRYPT) ---');
  let adminToken = null;
  let userToken = null;
  let tempUserId = null;
  const testEmail = `test_runner_${Date.now()}@emergencycare.app`;

  try {
    // 2.1 Register
    const regRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test Runner User',
        email: testEmail,
        mobile: '+91 9888877777',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token, `POST /api/auth/register creates user and issues JWT: ${regData.user?.email}`);
    tempUserId = regData.user?.id;

    // 2.2 Duplicate check
    const dupRes = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Dup User',
        email: testEmail,
        mobile: '+91 9888877777',
        password: 'Password@123',
        confirmPassword: 'Password@123'
      })
    });
    assert(dupRes.status === 400, 'POST /api/auth/register blocks duplicate email (HTTP 400)');

    // 2.3 Sign In Normal User
    const uLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: 'Password@123' })
    });
    const uLoginData = await uLoginRes.json();
    userToken = uLoginData.token;
    assert(uLoginRes.status === 200 && userToken, `User Sign In returns JWT token (Role: ${uLoginData.user?.role})`);

    // 2.4 Sign In Admin
    const aLoginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@emergencycare.app', password: 'Admin@123' })
    });
    const aLoginData = await aLoginRes.json();
    adminToken = aLoginData.token;
    assert(aLoginRes.status === 200 && aLoginData.user?.role === 'admin', `Admin Sign In succeeds with role: admin`);

    // 2.5 Inactive Account Blocking
    const inactRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactive@emergencycare.app', password: 'User@123' })
    });
    const inactData = await inactRes.json();
    assert(inactRes.status === 403 && inactData.code === 'ACCOUNT_DEACTIVATED', `Deactivated account is blocked (HTTP 403, code: ACCOUNT_DEACTIVATED)`);

    // 2.6 GET /api/auth/me
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.user?.email === testEmail, `GET /api/auth/me returns verified user profile`);
  } catch (err) {
    assert(false, `Auth error: ${err.message}`);
  }

  // --- PART 3: ADMIN ACCESS CONTROL & DATA MANAGEMENT ---
  console.log('\n--- 3. ADMIN CONTROLS & RBAC SECURITY ---');
  try {
    // 3.1 Non-admin blocked from admin route
    const blockedRes = await fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${userToken}` }
    });
    assert(blockedRes.status === 403, 'Normal user blocked from /api/admin/stats (HTTP 403 Forbidden)');

    // 3.2 Admin access to stats
    const statsRes = await fetch('http://localhost:5000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.stats.totalUsers > 0, `Admin gets live system stats (Total: ${statsData.stats.totalUsers}, Active: ${statsData.stats.activeUsers})`);

    // 3.3 Admin list users with filter
    const usersRes = await fetch('http://localhost:5000/api/admin/users?role=user', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const usersData = await usersRes.json();
    assert(usersRes.status === 200 && Array.isArray(usersData.users), `Admin retrieves filtered users list (${usersData.users.length} users)`);

    // 3.4 Admin deactivate user
    if (tempUserId) {
      const deactRes = await fetch(`http://localhost:5000/api/admin/users/${tempUserId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'deactivated' })
      });
      const deactData = await deactRes.json();
      assert(deactRes.status === 200 && deactData.user?.status === 'deactivated', `Admin successfully toggles user status to deactivated`);

      // Verify login is now blocked
      const reLogin = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, password: 'Password@123' })
      });
      assert(reLogin.status === 403, 'Newly deactivated user login is blocked immediately');

      // 3.5 Admin delete test user
      const delRes = await fetch(`http://localhost:5000/api/admin/users/${tempUserId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert(delRes.status === 200, 'Admin deletes user record successfully');
    }
  } catch (err) {
    assert(false, `Admin error: ${err.message}`);
  }

  // --- PART 4: DATABASE & EMERGENCY CARE DATA ---
  console.log('\n--- 4. SUPABASE DATABASE & EMERGENCY ENGINE ---');
  try {
    const hospitals = await getHospitalsFromDb();
    assert(Array.isArray(hospitals) && hospitals.length >= 5, `Supabase returns hospital records (${hospitals.length} hospitals loaded)`);

    const firstHosp = hospitals[0];
    assert(firstHosp.name && firstHosp.beds && firstHosp.latitude, `Hospital record contains full schema (Name: "${firstHosp.name}", ICU Beds: ${firstHosp.beds?.icu_available})`);

    // Distance calculation check
    const dist = calculateDistance(12.9716, 77.5946, firstHosp.latitude, firstHosp.longitude);
    assert(typeof dist === 'number' && dist >= 0, `Geo distance calculation works (${dist} km)`);

    // Pricing calculation check
    const pricing = calculateBookingEstimate({
      hospitalId: firstHosp.id,
      bedType: 'icu',
      needAmbulance: true,
      distanceKm: dist || 2.5,
      scheme: 'Ayushman Bharat (PM-JAY)',
    });
    assert(pricing.subtotalEstimate > 0 && pricing.isCashlessScheme === true, `Transparent pricing tariff engine operates correctly (Subtotal: ₹${pricing.subtotalEstimate}, Advance Payable: ₹${pricing.finalPayableAdvance}, Cashless: ${pricing.isCashlessScheme})`);
  } catch (err) {
    assert(false, `Database/Engine error: ${err.message}`);
  }

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runComprehensiveTest();
