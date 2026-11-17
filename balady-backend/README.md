<div align="center">

# 🏛️ نظام الشهادات الصحية — Balady Health Certificates API

**الباك إند الخاص بنظام إدارة الشهادات الصحية لمشروع بلدي (أجير)**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Image_Upload-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 📋 فهرس المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [هيكل المشروع](#-هيكل-المشروع)
- [متطلبات التشغيل](#-متطلبات-التشغيل)
- [التثبيت والإعداد](#-التثبيت-والإعداد)
- [متغيرات البيئة](#-متغيرات-البيئة-env)
- [تشغيل المشروع](#-تشغيل-المشروع)
- [قاعدة البيانات (Models)](#-قاعدة-البيانات-models)
- [الـ API Endpoints](#-الـ-api-endpoints)
- [نظام المصادقة (Authentication)](#-نظام-المصادقة-authentication)
- [رفع الصور (Cloudinary)](#-رفع-الصور-cloudinary)
- [النسخ الاحتياطي والاستعادة](#-النسخ-الاحتياطي-والاستعادة)
- [أدوات مساعدة (Utility Scripts)](#-أدوات-مساعدة-utility-scripts)
- [Swagger API Docs](#-swagger-api-docs)
- [النشر على Vercel](#-النشر-على-vercel)
- [الـ CORS والأمان](#-الـ-cors-والأمان)

---

## 🌟 نظرة عامة

هذا هو الباك إند (REST API) الخاص بنظام **"بلدي"** لإدارة الشهادات الصحية. النظام يتيح:

- ✅ **إنشاء وتعديل وحذف** الشهادات الصحية
- ✅ **رفع الصور الشخصية** للشهادات عبر Cloudinary
- ✅ **عرض عام** للشهادة بدون مصادقة (للتحقق العام عبر QR Code)
- ✅ **نظام مصادقة JWT** لحماية عمليات الإدارة
- ✅ **نسخ احتياطي واستعادة** كاملة للبيانات
- ✅ **ترقيم تسلسلي تلقائي** للشهادات
- ✅ **بحث برقم الرخصة** مع تعبئة تلقائية
- ✅ **توثيق API تفاعلي** عبر Swagger UI
- ✅ **دعم التقويم الهجري والميلادي**

---

## 🛠️ التقنيات المستخدمة

| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| **Node.js** | 18+ | بيئة التشغيل |
| **Express.js** | 4.18.2 | إطار العمل الرئيسي للـ REST API |
| **MongoDB Atlas** | — | قاعدة البيانات (NoSQL) |
| **Mongoose** | 7.4.0 | ODM للتعامل مع MongoDB |
| **JWT (jsonwebtoken)** | 9.0.0 | المصادقة والتوكنات |
| **bcrypt** | 5.1.0 | تشفير كلمات المرور |
| **Cloudinary** | 1.40.0 | رفع وتخزين الصور |
| **Multer** | 1.4.5 | معالجة رفع الملفات (multipart/form-data) |
| **multer-storage-cloudinary** | 4.0.0 | ربط Multer مع Cloudinary مباشرة |
| **Swagger (swagger-jsdoc + swagger-ui-express)** | 6.2.8 / 5.0.1 | توثيق الـ API تفاعلياً |
| **CORS** | 2.8.5 | التحكم في الأصول المسموح بها |
| **dotenv** | 16.3.1 | إدارة متغيرات البيئة |
| **Nodemon** | 3.0.1 | (dev) إعادة تشغيل تلقائية أثناء التطوير |
| **Vercel** | — | النشر والاستضافة (Serverless) |

---

## 📁 هيكل المشروع

```
project-baladi-back-end-node-js/
└── backend/
    ├── server.js                 # 🚀 نقطة الدخول الرئيسية – إعداد Express و MongoDB
    ├── swagger.js                # 📚 إعداد Swagger UI + تعريف كل الـ API Docs
    ├── package.json              # 📦 التبعيات والسكربتات
    ├── vercel.json               # ☁️ إعدادات النشر على Vercel
    ├── .env                      # 🔒 متغيرات البيئة (لا يُرفع على Git)
    │
    ├── models/
    │   ├── Admin.js              # 👤 موديل الأدمن (username + passwordHash)
    │   └── Certificate.js        # 📄 موديل الشهادة الصحية (كل الحقول)
    │
    ├── routes/
    │   ├── auth.js               # 🔐 راوتر المصادقة (تسجيل الدخول)
    │   └── certificates.js       # 📄 راوتر الشهادات (CRUD + بحث + نسخ احتياطي)
    │
    ├── create-admin.js           # 🛠️ سكربت إنشاء أدمن جديد من الـ CLI
    ├── test-connection.js        # 🔌 سكربت اختبار الاتصال بـ MongoDB و Cloudinary
    ├── export-data.js            # 💾 سكربت تصدير كل البيانات كملفات JSON
    └── exported-data/            # 📂 مجلد التصدير (ملفات JSON المُصدَّرة)
```

---

## 📋 متطلبات التشغيل

- **Node.js** v18 أو أحدث
- **npm** v9 أو أحدث
- حساب **MongoDB Atlas** (أو أي MongoDB instance)
- حساب **Cloudinary** (لرفع الصور)

---

## ⚡ التثبيت والإعداد

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/project-baladi-back-end-node-js.git

# 2. الانتقال لمجلد الباك إند
cd project-baladi-back-end-node-js/backend

# 3. تثبيت التبعيات
npm install

# 4. إنشاء ملف .env (انظر القسم التالي)
cp .env.example .env
# ثم عدّل القيم حسب إعداداتك

# 5. تشغيل السيرفر
npm run dev
```

---

## 🔒 متغيرات البيئة (.env)

أنشئ ملف `.env` داخل مجلد `backend/` بالمحتوى التالي:

```env
# === قاعدة البيانات ===
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority

# === المصادقة ===
JWT_SECRET=your_super_secure_jwt_secret_key

# === Cloudinary (رفع الصور) ===
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# === السيرفر ===
PORT=5000

# === خيارات إضافية ===
ALLOW_START_WITHOUT_DB=false          # true للسماح بالتشغيل بدون اتصال DB
SWAGGER_SERVER_URL=https://your-api.vercel.app   # (اختياري) رابط السيرفر في Swagger
```

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `MONGO_URI` | ✅ | رابط الاتصال بـ MongoDB Atlas أو أي MongoDB instance |
| `JWT_SECRET` | ✅ | مفتاح سري لتوقيع الـ JWT tokens (غيّره لقيمة آمنة) |
| `CLOUDINARY_CLOUD_NAME` | ✅ | اسم الـ Cloud في Cloudinary |
| `CLOUDINARY_API_KEY` | ✅ | مفتاح API من Cloudinary |
| `CLOUDINARY_API_SECRET` | ✅ | المفتاح السري من Cloudinary |
| `PORT` | ❌ | بورت السيرفر (الافتراضي: `5000`) |
| `ALLOW_START_WITHOUT_DB` | ❌ | السماح بالتشغيل بدون قاعدة بيانات |
| `SWAGGER_SERVER_URL` | ❌ | رابط السيرفر المعروض في Swagger (للإنتاج) |

> ⚠️ **تحذير:** لا ترفع ملف `.env` على Git أبداً. تأكد إنه موجود في `.gitignore`.

---

## 🚀 تشغيل المشروع

```bash
# التشغيل في وضع التطوير (مع إعادة تشغيل تلقائية)
npm run dev

# التشغيل في وضع الإنتاج
npm start

# إنشاء أدمن جديد
npm run create-admin -- <username> <password>
# مثال:
npm run create-admin -- admin 123456
```

بعد التشغيل:
- 🌐 **السيرفر**: `http://localhost:5000`
- 📚 **Swagger Docs**: `http://localhost:5000/api-docs`
- 📄 **Swagger JSON**: `http://localhost:5000/api-docs.json`

---

## 🗄️ قاعدة البيانات (Models)

### 👤 Admin Model

```javascript
{
  username:     String (unique),    // اسم المستخدم
  passwordHash: String              // كلمة المرور مشفرة بـ bcrypt
}
```

### 📄 Certificate Model

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `uuid` | `String` (required, unique) | معرّف فريد عام يتم توليده تلقائياً (16 حرف hex) |
| `name` | `String` | اسم صاحب الشهادة |
| `amana` | `String` | الأمانة (مثل: أمانة منطقة الرياض) |
| `baladiya` | `String` | البلدية |
| `nationalId` | `String` | رقم الهوية الوطنية |
| `healthCertificateNumber` | `String` | رقم الشهادة الصحية (تسلسلي) |
| `job` | `String` | المهنة |
| `nationality` | `String` | الجنسية |
| `gender` | `String` | الجنس |
| `healthCertIssueDate` | `Date` | تاريخ الإصدار (ميلادي) |
| `healthCertExpiryDate` | `Date` | تاريخ الانتهاء (ميلادي) |
| `healthCertIssueDateHijri` | `String` | تاريخ الإصدار (هجري) |
| `healthCertExpiryDateHijri` | `String` | تاريخ الانتهاء (هجري) |
| `educationalProgram` | `String` | البرنامج التثقيفي |
| `educationalProgramEndDate` | `Date` | تاريخ انتهاء البرنامج |
| `licenseNumber` | `String` | رقم الرخصة |
| `establishmentName` | `String` | اسم المنشأة |
| `establishmentNumber` | `String` | رقم المنشأة |
| `photoUrl` | `String` | رابط الصورة على Cloudinary |
| `photoPublicId` | `String` | معرف الصورة على Cloudinary (للحذف) |
| `photoBuffer` | `Buffer` | بيانات الصورة (غير مستخدم حالياً) |
| `isLocked` | `Boolean` | حالة قفل الشهادة (الافتراضي: `false`) |
| `selectedLogo` | `String` | شعار الأمانة المختار (الافتراضي: `logos/الرياض.png`) |
| `createdAt` | `Date` | تاريخ الإنشاء (تلقائي) |

---

## 🔗 الـ API Endpoints

### 🔐 المصادقة (Auth)

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| `POST` | `/api/login` | ❌ | تسجيل الدخول والحصول على JWT Token |

**طلب تسجيل الدخول:**
```json
{
  "username": "admin",
  "password": "123456"
}
```

**الاستجابة:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

> 📝 التوكن صالح لمدة **8 ساعات**.

---

### 📄 الشهادات (Certificates) — CRUD

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| `GET` | `/api/certificates` | ✅ | جلب آخر 500 شهادة (الأحدث أولاً) |
| `POST` | `/api/certificates` | ✅ | إنشاء شهادة صحية جديدة (multipart/form-data) |
| `GET` | `/api/certificates/:id` | ❌ | عرض شهادة بالـ UUID أو MongoDB ID (عام) |
| `PUT` | `/api/certificates/:id` | ✅ | تحديث شهادة (مع إمكانية تغيير الصورة) |
| `DELETE` | `/api/certificates/:id` | ✅ | حذف شهادة (يحذف الصورة من Cloudinary تلقائياً) |

---

### 🔍 البحث (Search)

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| `GET` | `/api/certificates/license/:licenseNumber` | ✅ | بحث بآخر شهادة برقم رخصة محدد (للتعبئة التلقائية) |
| `GET` | `/api/certificates-next-number` | ✅ | جلب الرقم التسلسلي التالي للشهادة |

---

### 💾 النسخ الاحتياطي (Backup & Restore)

| Method | Endpoint | Auth | الوصف |
|--------|----------|------|-------|
| `GET` | `/api/certificates-backup` | ✅ | تحميل كل الشهادات كملف JSON |
| `POST` | `/api/certificates-restore` | ✅ | استيراد شهادات من ملف JSON (يتخطى الموجودة) |

---

## 🔐 نظام المصادقة (Authentication)

النظام يستخدم **JWT (JSON Web Tokens)** لحماية الـ Endpoints.

### كيف يعمل:

1. **تسجيل الدخول**: إرسال `POST /api/login` مع username و password
2. **الحصول على التوكن**: الاستجابة تحتوي على JWT token صالح لـ 8 ساعات
3. **إرسال التوكن**: مع كل طلب محمي، أرسل التوكن في الـ Header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

### طريقتان للمصادقة:

| الطريقة | الوصف |
|---------|-------|
| **Hardcoded Admin** | يوجد أدمن ثابت في الكود (`admin` / `123456`) — يعمل دائماً |
| **Database Admin** | يتم التحقق من قاعدة البيانات — كلمة المرور مشفرة بـ bcrypt |

### Middleware المصادقة:

```javascript
// يُستخدم كـ middleware في كل endpoint محمي
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
```

> ⚠️ إذا لم يتم تعريف `JWT_SECRET` في ملف `.env`، يتم استخدام مفتاح افتراضي للتطوير المحلي فقط.

---

## 📸 رفع الصور (Cloudinary)

النظام يستخدم **Cloudinary** لرفع وتخزين الصور الشخصية للشهادات.

### الآلية:

1. **الرفع**: يتم عبر `multer` + `multer-storage-cloudinary`
2. **التخزين**: الصور تُرفع في مجلد `certificates` على Cloudinary بصيغة `jpg`
3. **تسمية الملف**: يتم توليد اسم فريد تلقائياً (`timestamp-randomNumber`)
4. **التحديث**: عند تحديث الصورة، يتم حذف الصورة القديمة تلقائياً من Cloudinary
5. **الحذف**: عند حذف شهادة، يتم حذف الصورة من Cloudinary تلقائياً

### البيانات المحفوظة:

| الحقل | الوصف |
|-------|-------|
| `photoUrl` | الرابط العام للصورة على Cloudinary |
| `photoPublicId` | الـ Public ID (يُستخدم لحذف الصورة) |

---

## 💾 النسخ الاحتياطي والاستعادة

### تحميل نسخة احتياطية

```bash
# عبر API (يتطلب توكن)
GET /api/certificates-backup
Authorization: Bearer <token>
```

- يُرجع ملف JSON يحتوي على **كل** الشهادات
- اسم الملف: `نسخة احتياطية YYYY-MM-DD HH-MM.json`

### استيراد نسخة احتياطية

```bash
# عبر API (يتطلب توكن)
POST /api/certificates-restore
Authorization: Bearer <token>
Content-Type: multipart/form-data

# Body: file = الملف الـ JSON
```

- الشهادات الموجودة (بنفس `uuid`) **لن تُعدَّل**
- فقط الشهادات الجديدة ستُضاف
- يُرجع تقرير بعدد المُضاف والمتخطّى:

```json
{
  "success": true,
  "added": 10,
  "skipped": 5,
  "total": 15,
  "message": "تم استيراد 10 شهادة جديدة بنجاح، وتجاهل 5 شهادة موجودة بالفعل."
}
```

---

## 🛠️ أدوات مساعدة (Utility Scripts)

### 1. إنشاء أدمن جديد (`create-admin.js`)

```bash
node create-admin.js <username> <password>
# أو
npm run create-admin -- <username> <password>
```

- يتصل بـ MongoDB ويُنشئ حساب أدمن جديد
- كلمة المرور تُشفَّر بـ bcrypt (10 rounds)

### 2. اختبار الاتصال (`test-connection.js`)

```bash
node test-connection.js
```

- يختبر الاتصال بـ **MongoDB** ✅/❌
- يختبر الاتصال بـ **Cloudinary** ✅/❌

### 3. تصدير البيانات (`export-data.js`)

```bash
node export-data.js
```

- يصدّر كل **الشهادات** و **الأدمنز** كملفات JSON
- يحفظها في مجلد `exported-data/` مع timestamp

---

## 📚 Swagger API Docs

التوثيق التفاعلي متاح عبر **Swagger UI** على:

```
http://localhost:5000/api-docs
```

### المميزات:

- ✅ كل الـ Endpoints موثقة مع أمثلة
- ✅ إمكانية **تجربة الطلبات مباشرة** (Try it out)
- ✅ دعم **المصادقة** (Authorize بالتوكن)
- ✅ **حفظ التوكن** تلقائياً بين الجلسات
- ✅ الـ API مقسمة لأقسام واضحة:
  - 🔐 المصادقة (Auth)
  - 📄 الشهادات (Certificates)
  - 🔍 البحث (Search)
  - 💾 النسخ الاحتياطي (Backup)

### الحصول على الـ Spec بصيغة JSON:

```
GET /api-docs.json
```

---

## ☁️ النشر على Vercel

المشروع مُعَد للنشر على **Vercel** كدالة Serverless.

### ملف `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

### خطوات النشر:

1. اربط الريبو بـ Vercel
2. عيّن **Root Directory** إلى `backend`
3. أضف كل متغيرات `.env` في إعدادات Vercel (Environment Variables)
4. انشر! 🚀

> 📝 تأكد من إضافة `SWAGGER_SERVER_URL` بقيمة رابط الإنتاج لعرض الرابط الصحيح في Swagger.

---

## 🛡️ الـ CORS والأمان

### الأصول المسموح بها (Allowed Origins):

```javascript
const allowedOrigins = [
  'https://appbalady.vercel.app',
  'https://balabygov.vercel.app',
  'https://www.balabygov.vercel.app',
  'http://localhost:3000',     // React dev
  'http://localhost:5173',     // Vite dev
];
```

### إعدادات CORS:

| الإعداد | القيمة |
|---------|--------|
| **Methods** | `GET, POST, PUT, DELETE, OPTIONS` |
| **Allowed Headers** | `Content-Type, Authorization, X-Requested-With, Accept` |
| **Credentials** | `true` |
| **Options Status** | `200` (لدعم المتصفحات القديمة) |

> 📝 الطلبات بدون `origin` (مثل تطبيقات الموبايل و curl) مسموح بها تلقائياً.

---

## 📝 ملاحظات إضافية

- **الأدمن الافتراضي**: يوجد أدمن ثابت في الكود (`admin` / `123456`) يعمل دائماً حتى لو قاعدة البيانات غير متاحة
- **UUID**: كل شهادة تحصل على `uuid` فريد (16 حرف hex) يُستخدم في روابط العرض العام و QR Codes
- **الصور**: تُحذف تلقائياً من Cloudinary عند تحديث أو حذف الشهادة
- **التواريخ**: النظام يدعم التقويم الهجري والميلادي معاً
- **قفل الشهادات**: يمكن قفل شهادة (`isLocked: true`) لمنع التعديل
- **الترقيم التسلسلي**: يُحسب تلقائياً بجلب أعلى رقم موجود + 1

---

<div align="center">

**صُنع بـ ❤️ لمشروع بلدي (أجير)**

</div>
