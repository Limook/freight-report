module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseKey: process.env.SUPABASE_ANON_KEY || ""
  });
};
