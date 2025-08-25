async function ensureAuth() {
  try {
    const response = await fetch('api/protected.php', { credentials: 'include' });
    if (response.status !== 200) {
      window.location.href = 'login.html';
      return null;
    }
    return await response.json();
  } catch (err) {
    console.error('Auth check failed:', err);
    window.location.href = 'login.html';
    return null;
  }
}
