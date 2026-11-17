require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Certificate = require('./models/Certificate');
const Admin = require('./models/Admin');

const MONGO_URI = process.env.MONGO_URI;

async function exportData() {
  console.log('🔌 Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected successfully!\n');

    // Export Certificates
    console.log('📦 Fetching certificates...');
    const certificates = await Certificate.find({}).lean();
    console.log(`✅ Found ${certificates.length} certificates`);

    // Export Admins (بدون الباسوردات)
    console.log('📦 Fetching admins...');
    const admins = await Admin.find({}).select('-password').lean();
    console.log(`✅ Found ${admins.length} admins`);

    // Save to files
    const exportDir = path.join(__dirname, 'exported-data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

    const certFile = path.join(exportDir, `certificates_${timestamp}.json`);
    fs.writeFileSync(certFile, JSON.stringify(certificates, null, 2), 'utf-8');
    console.log(`\n💾 Certificates saved to: exported-data/certificates_${timestamp}.json`);

    const adminFile = path.join(exportDir, `admins_${timestamp}.json`);
    fs.writeFileSync(adminFile, JSON.stringify(admins, null, 2), 'utf-8');
    console.log(`💾 Admins saved to: exported-data/admins_${timestamp}.json`);

    console.log('\n✅ Export complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Certificates: ${certificates.length}`);
    console.log(`   - Admins: ${admins.length}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

exportData();
