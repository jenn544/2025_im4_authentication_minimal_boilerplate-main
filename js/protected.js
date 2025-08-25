document.addEventListener('DOMContentLoaded', async () => {
  const result = await ensureAuth();
  if (!result) return;
  const protectedContent = document.getElementById('protectedContent');
  protectedContent.innerHTML = `
      <h2>Welcome, ${result.email}!</h2>
      <p>Your user ID is: ${result.user_id}</p>
    `;
});
