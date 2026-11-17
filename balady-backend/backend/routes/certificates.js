const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Certificate = require('../models/Certificate');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'certificates',
    format: async (req, file) => 'jpg',
    public_id: (req, file) => {
      return Date.now() + '-' + Math.round(Math.random() * 1e9);
    },
  },
});

const upload = multer({ storage });


function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = payload.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// create certificate (accepts multipart form-data if photo uploaded)
router.post('/certificates', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const body = req.body;
    const uuid = require('crypto').randomBytes(8).toString('hex');
    let photoUrl = '';
    let photoBuffer = null;
    let photoPublicId = '';

    if (req.file) {
      // multer-storage-cloudinary exposes the hosted URL at req.file.path and public_id at req.file.filename
      photoUrl = req.file.path;
      photoPublicId = req.file.filename;
      // في الواقع، سنحفظ الـ Buffer من الصورة المرفوعة
      // لكن Cloudinary لا يوفر access مباشر للـ buffer
      // لذلك سنحفظ URL فقط مع حفظ metadata
    }

    // Safe date parsing - convert to valid Date or null
    const parseDate = (val) => {
      if (!val) return null;
      const d = new Date(val);
      return isNaN(d.getTime()) ? null : d;
    };

    const data = {
      uuid,
      name: body.name,
      amana: body.amana,
      baladiya: body.baladiya,
      nationalId: body.nationalId,
      healthCertificateNumber: body.healthCertificateNumber,
      job: body.job,
      nationality: body.nationality,
      gender: body.gender,
      healthCertIssueDate: parseDate(body.healthCertIssueDate),
      healthCertExpiryDate: parseDate(body.healthCertExpiryDate),
      healthCertIssueDateHijri: body.healthCertIssueDateHijri || null,
      healthCertExpiryDateHijri: body.healthCertExpiryDateHijri || null,
      educationalProgram: body.educationalProgram,
      educationalProgramEndDate: parseDate(body.educationalProgramEndDate),
      licenseNumber: body.licenseNumber,
      establishmentName: body.establishmentName,
      establishmentNumber: body.establishmentNumber,
      selectedLogo: body.selectedLogo || 'logos/الرياض.png',
      photoUrl,
      photoBuffer,
      photoPublicId
    };
    const cert = new Certificate(data);
    await cert.save();
    res.json({ success: true, id: cert._id, uuid: cert.uuid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// public get by uuid or id (MUST come before /certificates to avoid route matching issues)
router.get('/certificates/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let doc = await Certificate.findOne({ uuid: id });
    if (!doc && mongoose.Types.ObjectId.isValid(id)) {
      doc = await Certificate.findById(id);
    }
    if (!doc) return res.status(404).json({ message: 'الشهادة غير موجودة' });
    const host = req.get('host');
    const proto = req.protocol;
    if (doc.photoUrl && doc.photoUrl.startsWith('/uploads')) {
      doc.photoUrl = proto + '://' + host + doc.photoUrl;
    }
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// dashboard list
router.get('/certificates', authMiddleware, async (req, res) => {
  const list = await Certificate.find().sort({ createdAt: -1 }).limit(500);
  res.json(list);
});


// update certificate
router.put('/certificates/:id', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const cert = await Certificate.findById(id);
    if (!cert) return res.status(404).json({ message: 'Not found' });

    // update fields
    cert.name = body.name || cert.name;
    cert.amana = body.amana || cert.amana;
    cert.baladiya = body.baladiya || cert.baladiya;
    cert.nationalId = body.nationalId || cert.nationalId;
    cert.healthCertificateNumber = body.healthCertificateNumber || cert.healthCertificateNumber;
    cert.job = body.job || cert.job;
    cert.nationality = body.nationality || cert.nationality;
    cert.gender = body.gender || cert.gender;
    cert.healthCertIssueDate = body.healthCertIssueDate || cert.healthCertIssueDate;
    cert.healthCertExpiryDate = body.healthCertExpiryDate || cert.healthCertExpiryDate;
    cert.healthCertIssueDateHijri = body.healthCertIssueDateHijri || cert.healthCertIssueDateHijri;
    cert.healthCertExpiryDateHijri = body.healthCertExpiryDateHijri || cert.healthCertExpiryDateHijri;
    cert.educationalProgram = body.educationalProgram || cert.educationalProgram;
    cert.educationalProgramEndDate = body.educationalProgramEndDate || cert.educationalProgramEndDate;
    cert.licenseNumber = body.licenseNumber || cert.licenseNumber;
    cert.establishmentName = body.establishmentName || cert.establishmentName;
    cert.establishmentNumber = body.establishmentNumber || cert.establishmentNumber;
    cert.selectedLogo = body.selectedLogo || cert.selectedLogo;
    if (typeof body.isLocked !== 'undefined') {
      cert.isLocked = body.isLocked;
    }

    // if new photo uploaded
    if (req.file) {
      // delete old photo from Cloudinary if exists
      if (cert.photoPublicId) {
        try {
          await cloudinary.uploader.destroy(cert.photoPublicId);
        } catch (err) {
          console.log('Error deleting old photo:', err);
        }
      }
      cert.photoUrl = req.file.path;
      cert.photoPublicId = req.file.filename;
    }

    console.log('Update Request Body:', body);
    if (typeof body.isLocked !== 'undefined') {
      console.log('Updating isLocked to:', body.isLocked);
      cert.isLocked = body.isLocked;
    }
    // check type
    await cert.save();
    console.log('Saved Cert:', cert);
    res.json({ success: true, certificate: cert });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// delete certificate
router.delete('/certificates/:id', authMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const cert = await Certificate.findById(id);
    if (!cert) return res.status(404).json({ message: 'Not found' });

    // delete photo from Cloudinary if exists
    if (cert.photoPublicId) {
      try {
        await cloudinary.uploader.destroy(cert.photoPublicId);
      } catch (err) {
        console.log('Error deleting photo:', err);
      }
    }

    await Certificate.findByIdAndDelete(id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// get certificate by license number (for autofill)
router.get('/certificates/license/:licenseNumber', authMiddleware, async (req, res) => {
  try {
    const licenseNumber = req.params.licenseNumber;
    // Find the most recent certificate with this license number
    const cert = await Certificate.findOne({ licenseNumber }).sort({ createdAt: -1 });

    if (!cert) {
      return res.status(404).json({ message: 'Not found' });
    }

    res.json(cert);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// get next sequential health certificate number
router.get('/certificates-next-number', authMiddleware, async (req, res) => {
  try {
    // Get all certs with a numeric healthCertificateNumber, sorted descending
    const certs = await Certificate.find(
      { healthCertificateNumber: { $exists: true, $ne: '' } },
      { healthCertificateNumber: 1 }
    );

    let maxNum = 0;
    for (const c of certs) {
      const num = parseInt(c.healthCertificateNumber, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    }

    const nextNumber = maxNum + 1;
    res.json({ nextNumber: String(nextNumber) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// backup: export all certificates as downloadable JSON
router.get('/certificates-backup', authMiddleware, async (req, res) => {
  try {
    const all = await Certificate.find().sort({ createdAt: -1 });
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const filename = `نسخة احتياطية ${dateStr} ${hours}-${minutes}.json`;
    const encodedFilename = encodeURIComponent(filename); // encode Arabic for header
    res.setHeader('Content-Disposition', `attachment; filename="backup_${dateStr}_${hours}-${minutes}.json"; filename*=UTF-8''${encodedFilename}`);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(JSON.stringify(all, null, 2));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// restore: import certificates from uploaded JSON file
const multerMemory = multer({ storage: multer.memoryStorage() });

router.post('/certificates-restore', authMiddleware, multerMemory.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
    }

    let data;
    try {
      data = JSON.parse(req.file.buffer.toString('utf8'));
    } catch (e) {
      return res.status(400).json({ message: 'الملف غير صالح - يجب أن يكون JSON صحيح' });
    }

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(400).json({ message: 'الملف فارغ أو تنسيقه غير صحيح' });
    }

    const DATE_FIELDS = [
      'healthCertIssueDate',
      'healthCertExpiryDate',
      'educationalProgramEndDate',
      'createdAt',
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const cert of data) {
      if (!cert.uuid) {
        skippedCount++;
        continue;
      }

      const existing = await Certificate.findOne({ uuid: cert.uuid });
      if (existing) {
        skippedCount++;
        continue;
      }

      const { _id, __v, ...certData } = cert;
      const docData = { ...certData, uuid: cert.uuid };

      if (_id) {
        let targetId = _id;
        if (typeof _id === 'object' && _id.$oid) {
          targetId = _id.$oid;
        }
        docData._id = new mongoose.Types.ObjectId(String(targetId));
      }

      for (const field of DATE_FIELDS) {
        if (docData[field] && typeof docData[field] === 'string') {
          const d = new Date(docData[field]);
          if (!isNaN(d.getTime())) docData[field] = d;
        }
      }

      await Certificate.create(docData);
      addedCount++;
    }

    res.json({
      success: true,
      added: addedCount,
      skipped: skippedCount,
      total: data.length,
      message: `تم استيراد ${addedCount} شهادة جديدة بنجاح، وتجاهل ${skippedCount} شهادة موجودة بالفعل.`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

