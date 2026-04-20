const mongoose = require('mongoose');

/**
 * Normalise a MongoDB URI:
 *  • Always ends with a database name ("rehab-ai")
 *  • Accepts both mongodb:// and mongodb+srv://
 *  • Strips trailing slash before appending the db name
 */
const normalizeURI = (uri = '') => {
  let trimmed = uri.trim();
  
  // Node.js 17+ resolves localhost to IPv6 (::1) by default, but MongoDB often listens on IPv4.
  // We automatically replace localhost with 127.0.0.1 to prevent ECONNREFUSED network errors.
  trimmed = trimmed.replace('mongodb://localhost', 'mongodb://127.0.0.1');

  // Make sure the protocol is one of the two supported ones
  if (!trimmed.startsWith('mongodb://') && !trimmed.startsWith('mongodb+srv://')) {
    throw new Error(
      `Unsupported MongoDB URI protocol.\n` +
      `  Got: "${trimmed}"\n` +
      `  Expected: mongodb://localhost:27017/rehab-ai  (local)\n` +
      `       or: mongodb+srv://<user>:<pass>@cluster.mongodb.net/rehab-ai  (Atlas)`
    );
  }

  // If the URI already has a database name, leave it alone
  // Pattern: everything after the last '/' that isn't a query-string
  const withoutScheme = trimmed.replace(/^mongodb(\+srv)?:\/\//, '');
  const pathParts = withoutScheme.split('/');

  // pathParts[0]  = host(s)
  // pathParts[1]  = db name + optional query string (may be empty or missing)
  const dbPart = pathParts[1] ? pathParts[1].split('?')[0] : '';

  if (dbPart) {
    // DB name already present — return as-is (remove trailing slash if any)
    return trimmed.replace(/\/$/, '');
  }

  // No DB name — append "rehab-ai"
  return trimmed.replace(/\/$/, '') + '/rehab-ai';
};

const connectDB = async () => {
  try {
    const rawURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rehab-ai';
    const mongoURI = normalizeURI(rawURI);

    console.log(`🔌 Connecting to MongoDB…`);

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // fail fast during dev
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host} / ${conn.connection.name}`);

    mongoose.connection.on('error',        (err) => console.error('⚠️  MongoDB error:', err.message));
    mongoose.connection.on('disconnected', ()    => console.warn ('⚠️  MongoDB disconnected'));
    mongoose.connection.on('reconnected',  ()    => console.log  ('✅ MongoDB reconnected'));

  } catch (err) {
    console.error('\n❌ MongoDB connection failed');
    console.error('   Message:', err.message);

    if (err.message.includes('ECONNREFUSED')) {
      console.error('   → MongoDB is not running. Start it with:  mongod');
      console.error('   → Or provide a cloud URI in your .env:  MONGODB_URI=mongodb+srv://...');
    } else if (err.message.includes('Authentication') || err.message.includes('bad auth')) {
      console.error('   → Wrong username / password in MONGODB_URI');
    } else if (err.message.includes('Unsupported') || err.message.includes('protocol')) {
      console.error('   → Check MONGODB_URI starts with  mongodb://  or  mongodb+srv://');
      console.error('   → Also make sure a database name is included, e.g.:  mongodb://localhost:27017/rehab-ai');
    }

    process.exit(1);
  }
};

module.exports = connectDB;
