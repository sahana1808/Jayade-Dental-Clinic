res.json({
  success: true,
  token,
  user: {
    name: user.name,
    email: user.email,
    role: user.role
  }
});
