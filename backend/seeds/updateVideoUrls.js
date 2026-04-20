/**
 * Migration script: patch existing exercise documents with YouTube video URLs.
 * Run once with: node backend/seeds/updateVideoUrls.js
 */
const mongoose = require('mongoose');
const Exercise = require('../src/models/Exercise');
const dotenv = require('dotenv');

dotenv.config();

const videoMap = {
  'Knee Strengthening':   'https://www.youtube.com/embed/rsSV_lqbEVo',
  'Shoulder Rotation':    'https://www.youtube.com/embed/ldUwIBccnuw',
  'Back Stretching':      'https://www.youtube.com/embed/mORoTbGfhPU',
  'Hip Flexor Stretch':   'https://www.youtube.com/embed/mWOWpBGGY4k',
  'Knee Extension':       'https://www.youtube.com/embed/0Nt2EmOEcJQ',
  'Shoulder Blade Squeeze':'https://www.youtube.com/embed/QN1oZVMMRjE',
  'Quad Stretch':         'https://www.youtube.com/embed/LXjYdUS8NBM',
  'Hamstring Stretch':    'https://www.youtube.com/embed/zpOVtbN-Uyk',
};

async function run() {
  let rawURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rehab-ai';
  rawURI = rawURI.replace('mongodb://localhost', 'mongodb://127.0.0.1');
  await mongoose.connect(rawURI);
  console.log('✅ Connected to MongoDB');

  for (const [name, url] of Object.entries(videoMap)) {
    const result = await Exercise.updateMany({ name }, { $set: { videoUrl: url } });
    console.log(`  Updated "${name}": ${result.modifiedCount} doc(s)`);
  }

  await mongoose.disconnect();
  console.log('Done. Videos added to all exercises.');
}

run().catch(err => { console.error(err); process.exit(1); });
