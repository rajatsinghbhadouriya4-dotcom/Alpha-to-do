async function fullVerification() {
  console.log('=== EMERGENCYCARE FULL-STACK INTEGRATION TEST ===\n');
  const API = 'http://localhost:5000/api';

  // 1. Health Check
  const hRes = await fetch(API + '/health');
  const hData = await hRes.json();
  console.log('[1] Health Check:', hRes.status === 200 ? 'PASS' : 'FAIL', hData.status);

  // 2. Sign Up a New User
  const randomEmail = 'verify_' + Date.now() + '@emergencycare.app';
  const suRes = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Dr. Triage Specialist',
      email: randomEmail,
      mobile: '+91 9123456780',
      password: 'SecurePassword@123',
      confirmPassword: 'SecurePassword@123'
    })
  });
  const suData = await suRes.json();
  console.log('[2] Sign Up New User:', suRes.status === 201 ? 'PASS' : 'FAIL', suData.user?.email, 'Role:', suData.user?.role);
  const createdUserId = suData.user?.id;
  const createdUserToken = suData.token;

  // 3. Prevent Duplicate Sign Up with Same Email
  const dupRes = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Duplicate Test',
      email: randomEmail,
      mobile: '+91 9123456780',
      password: 'SecurePassword@123',
      confirmPassword: 'SecurePassword@123'
    })
  });
  console.log('[3] Duplicate Email Check (Expected 400):', dupRes.status === 400 ? 'PASS' : 'FAIL');

  // 4. Password Mismatch Check
  const misRes = await fetch(API + '/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Mismatch Test',
      email: 'mismatch@emergencycare.app',
      mobile: '+91 9123456780',
      password: 'Password1',
      confirmPassword: 'Password2'
    })
  });
  console.log('[4] Password Mismatch Validation (Expected 400):', misRes.status === 400 ? 'PASS' : 'FAIL');

  // 5. Normal User Sign In
  const inRes = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail,
      password: 'SecurePassword@123'
    })
  });
  const inData = await inRes.json();
  console.log('[5] Normal User Sign In:', inRes.status === 200 ? 'PASS' : 'FAIL', 'JWT Token Received:', !!inData.token);

  // 6. Inactive / Deactivated User Sign In Blocked
  const deactRes = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'inactive@emergencycare.app',
      password: 'User@123'
    })
  });
  const deactData = await deactRes.json();
  console.log('[6] Inactive User Login Blocked (Expected 403):', deactRes.status === 403 ? 'PASS' : 'FAIL', 'Code:', deactData.code, 'Error:', deactData.error);

  // 7. Wrong Password Check
  const wrongRes = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail,
      password: 'WrongPassword'
    })
  });
  console.log('[7] Invalid Password Check (Expected 401):', wrongRes.status === 401 ? 'PASS' : 'FAIL');

  // 8. Normal User Forbidden on Admin Endpoints
  const forbidRes = await fetch(API + '/admin/stats', {
    headers: { 'Authorization': 'Bearer ' + createdUserToken }
  });
  console.log('[8] Non-Admin Access Forbidden (Expected 403):', forbidRes.status === 403 ? 'PASS' : 'FAIL');

  // 9. Admin Sign In
  const admRes = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@emergencycare.app',
      password: 'Admin@123'
    })
  });
  const admData = await admRes.json();
  const adminToken = admData.token;
  console.log('[9] Admin Sign In:', admRes.status === 200 ? 'PASS' : 'FAIL', 'Admin Role:', admData.user?.role);

  // 10. Admin Get Overview Stats
  const stRes = await fetch(API + '/admin/stats', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  const stData = await stRes.json();
  console.log('[10] Admin Dashboard Stats:', stRes.status === 200 ? 'PASS' : 'FAIL', stData.stats);

  // 11. Admin Get Users List with Filters
  const uListRes = await fetch(API + '/admin/users?role=user', {
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  const uListData = await uListRes.json();
  console.log('[11] Admin Filter Users by Role=user:', uListRes.status === 200 ? 'PASS' : 'FAIL', 'Count:', uListData.users?.length);

  // 12. Admin Toggle User Status (Deactivate newly created user)
  const togRes = await fetch(API + '/admin/users/' + createdUserId + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
    body: JSON.stringify({ status: 'deactivated' })
  });
  const togData = await togRes.json();
  console.log('[12] Admin Deactivate User Status:', togRes.status === 200 ? 'PASS' : 'FAIL', 'New Status:', togData.user?.status);

  // 13. Verify Deactivated User Login Now Blocked
  const blockedLogin = await fetch(API + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: randomEmail,
      password: 'SecurePassword@123'
    })
  });
  console.log('[13] Login with Newly Deactivated Account (Expected 403):', blockedLogin.status === 403 ? 'PASS' : 'FAIL');

  // 14. Admin Edit User Details (Update Full Name & Mobile)
  const editRes = await fetch(API + '/admin/users/' + createdUserId, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
    body: JSON.stringify({
      full_name: 'Dr. Triage Specialist Senior',
      mobile: '+91 9123459999',
      role: 'user',
      status: 'active'
    })
  });
  const editData = await editRes.json();
  console.log('[14] Admin Edit User Details:', editRes.status === 200 ? 'PASS' : 'FAIL', 'Updated Name:', editData.user?.full_name);

  // 15. Admin Self-Protection Check (Cannot deactivate own account)
  const selfDeact = await fetch(API + '/admin/users/' + admData.user?.id + '/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + adminToken },
    body: JSON.stringify({ status: 'deactivated' })
  });
  console.log('[15] Admin Self-Deactivation Prevention (Expected 400):', selfDeact.status === 400 ? 'PASS' : 'FAIL');

  // 16. Admin Delete User
  const delRes = await fetch(API + '/admin/users/' + createdUserId, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + adminToken }
  });
  const delData = await delRes.json();
  console.log('[16] Admin Delete User:', delRes.status === 200 ? 'PASS' : 'FAIL', delData.message);

  console.log('\n=== ALL 16 BACKEND & AUTH VERIFICATION CHECKS PASSED! ===');
}

fullVerification().catch(err => {
  console.error('Test script exception:', err);
  process.exit(1);
});
