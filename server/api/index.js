// ABSOLUTE MINIMAL - no imports, no require, nothing
module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Backend is alive!',
    time: new Date().toISOString()
  });
};
