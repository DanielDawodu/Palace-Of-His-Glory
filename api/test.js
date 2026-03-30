module.exports = (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Vercel Platform Sanity Check Passed.",
    env: process.env.NODE_ENV,
    node: process.version,
    timestamp: new Date().toISOString()
  });
};
