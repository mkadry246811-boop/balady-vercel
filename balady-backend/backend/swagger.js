const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'نظام الشهادات الصحية - Balady Health Certificates API',
      version: '1.0.0',
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
        description: 'السيرفر الحالي',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'أدخل الـ JWT token بعد تسجيل الدخول',
        },
      },
      schemas: {
        // ===== LOGIN =====
        LoginRequest: {
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: {
              type: 'string',
              example: 'admin',
              description: 'اسم المستخدم',
            },
            password: {
              type: 'string',
              example: '123456',
              description: 'كلمة المرور',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIs...',
              description: 'JWT Token صالح لـ 8 ساعات',
            },
          },
        },

        // ===== CERTIFICATE =====
        Certificate: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '664a1b2c3d4e5f6a7b8c9d0e' },
            uuid: { type: 'string', example: 'a1b2c3d4e5f6g7h8', description: 'معرّف فريد عام' },
            name: { type: 'string', example: 'محمد أحمد', description: 'اسم صاحب الشهادة' },
            amana: { type: 'string', example: 'أمانة منطقة الرياض', description: 'الأمانة' },
            baladiya: { type: 'string', example: 'بلدية شمال الرياض', description: 'البلدية' },
            nationalId: { type: 'string', example: '1234567890', description: 'رقم الهوية' },
            healthCertificateNumber: { type: 'string', example: '100', description: 'رقم الشهادة الصحية' },
            job: { type: 'string', example: 'طباخ', description: 'المهنة' },
            nationality: { type: 'string', example: 'سعودي', description: 'الجنسية' },
            gender: { type: 'string', example: 'ذكر', description: 'الجنس' },
            healthCertIssueDate: { type: 'string', format: 'date', example: '2026-01-15', description: 'تاريخ الإصدار (ميلادي)' },
            healthCertExpiryDate: { type: 'string', format: 'date', example: '2027-01-15', description: 'تاريخ الانتهاء (ميلادي)' },
            healthCertIssueDateHijri: { type: 'string', example: '1447-07-15', description: 'تاريخ الإصدار (هجري)' },
            healthCertExpiryDateHijri: { type: 'string', example: '1448-07-15', description: 'تاريخ الانتهاء (هجري)' },
            educationalProgram: { type: 'string', example: 'برنامج سلامة الغذاء', description: 'نوع البرنامج التثقيفي' },
            educationalProgramEndDate: { type: 'string', format: 'date', description: 'تاريخ انتهاء البرنامج' },
            licenseNumber: { type: 'string', example: 'LIC-2024-001', description: 'رقم الرخصة' },
            establishmentName: { type: 'string', example: 'مطعم النجم', description: 'اسم المنشأة' },
            establishmentNumber: { type: 'string', example: 'EST-001', description: 'رقم المنشأة' },
            photoUrl: { type: 'string', example: 'https://res.cloudinary.com/...', description: 'رابط الصورة' },
            isLocked: { type: 'boolean', example: false, description: 'حالة القفل' },
            selectedLogo: { type: 'string', example: 'logos/الرياض.png', description: 'شعار الأمانة المختار' },
            createdAt: { type: 'string', format: 'date-time', description: 'تاريخ الإنشاء' },
          },
        },
        CertificateCreateSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            id: { type: 'string', example: '664a1b2c3d4e5f6a7b8c9d0e' },
            uuid: { type: 'string', example: 'a1b2c3d4e5f6g7h8' },
          },
        },
        CertificateUpdateSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            certificate: { $ref: '#/components/schemas/Certificate' },
          },
        },
        DeleteSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Deleted' },
          },
        },
        NextNumberResponse: {
          type: 'object',
          properties: {
            nextNumber: { type: 'string', example: '101', description: 'الرقم التسلسلي التالي' },
          },
        },
        RestoreResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            added: { type: 'integer', example: 10 },
            skipped: { type: 'integer', example: 5 },
            total: { type: 'integer', example: 15 },
            message: { type: 'string', example: 'تم استيراد 10 شهادة جديدة بنجاح، وتجاهل 5 شهادة موجودة بالفعل.' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Server error' },
          },
        },
      },
    },

    // ===== PATHS =====
    paths: {
      // ===== AUTH =====
      '/api/login': {
        post: {
          tags: ['🔐 المصادقة (Auth)'],
          summary: 'تسجيل الدخول',
          description: 'تسجيل دخول الأدمن والحصول على JWT Token صالح لمدة 8 ساعات',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/LoginRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'تم تسجيل الدخول بنجاح',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/LoginResponse' },
                },
              },
            },
            '401': {
              description: 'اسم المستخدم أو كلمة المرور غير صحيحة',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ===== CERTIFICATES CRUD =====
      '/api/certificates': {
        get: {
          tags: ['📄 الشهادات (Certificates)'],
          summary: 'قائمة الشهادات',
          description: 'جلب آخر 500 شهادة مرتبة بتاريخ الإنشاء (الأحدث أولاً) — يتطلب مصادقة',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'قائمة الشهادات',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Certificate' },
                  },
                },
              },
            },
            '401': {
              description: 'غير مصرّح',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
            },
          },
        },
        post: {
          tags: ['📄 الشهادات (Certificates)'],
          summary: 'إنشاء شهادة جديدة',
          description: 'إضافة شهادة صحية جديدة مع إمكانية رفع صورة شخصية',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['name'],
                  properties: {
                    name: { type: 'string', description: 'اسم صاحب الشهادة' },
                    amana: { type: 'string', description: 'الأمانة' },
                    baladiya: { type: 'string', description: 'البلدية' },
                    nationalId: { type: 'string', description: 'رقم الهوية' },
                    healthCertificateNumber: { type: 'string', description: 'رقم الشهادة الصحية' },
                    job: { type: 'string', description: 'المهنة' },
                    nationality: { type: 'string', description: 'الجنسية' },
                    gender: { type: 'string', description: 'الجنس' },
                    healthCertIssueDate: { type: 'string', format: 'date' },
                    healthCertExpiryDate: { type: 'string', format: 'date' },
                    healthCertIssueDateHijri: { type: 'string' },
                    healthCertExpiryDateHijri: { type: 'string' },
                    educationalProgram: { type: 'string' },
                    educationalProgramEndDate: { type: 'string' },
                    licenseNumber: { type: 'string' },
                    establishmentName: { type: 'string' },
                    establishmentNumber: { type: 'string' },
                    selectedLogo: { type: 'string' },
                    photo: { type: 'string', format: 'binary', description: 'صورة شخصية (اختياري)' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'تم إنشاء الشهادة بنجاح',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificateCreateSuccess' } } },
            },
            '401': { description: 'غير مصرّح' },
            '500': { description: 'خطأ في السيرفر' },
          },
        },
      },

      '/api/certificates/{id}': {
        get: {
          tags: ['📄 الشهادات (Certificates)'],
          summary: 'عرض شهادة',
          description: 'جلب شهادة واحدة بالـ UUID أو الـ MongoDB _id — **لا يتطلب مصادقة** (متاح للعرض العام)',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'UUID أو MongoDB _id للشهادة',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'بيانات الشهادة',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Certificate' } } },
            },
            '404': { description: 'الشهادة غير موجودة' },
          },
        },
        put: {
          tags: ['📄 الشهادات (Certificates)'],
          summary: 'تحديث شهادة',
          description: 'تعديل بيانات شهادة موجودة — يدعم رفع صورة جديدة (يتم حذف القديمة من Cloudinary تلقائياً)',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'MongoDB _id للشهادة',
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    amana: { type: 'string' },
                    baladiya: { type: 'string' },
                    nationalId: { type: 'string' },
                    healthCertificateNumber: { type: 'string' },
                    job: { type: 'string' },
                    nationality: { type: 'string' },
                    gender: { type: 'string' },
                    healthCertIssueDate: { type: 'string', format: 'date' },
                    healthCertExpiryDate: { type: 'string', format: 'date' },
                    healthCertIssueDateHijri: { type: 'string' },
                    healthCertExpiryDateHijri: { type: 'string' },
                    educationalProgram: { type: 'string' },
                    educationalProgramEndDate: { type: 'string' },
                    licenseNumber: { type: 'string' },
                    establishmentName: { type: 'string' },
                    establishmentNumber: { type: 'string' },
                    selectedLogo: { type: 'string' },
                    isLocked: { type: 'boolean', description: 'قفل/فتح الشهادة' },
                    photo: { type: 'string', format: 'binary', description: 'صورة شخصية جديدة (اختياري)' },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'تم التحديث بنجاح',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/CertificateUpdateSuccess' } } },
            },
            '404': { description: 'الشهادة غير موجودة' },
            '401': { description: 'غير مصرّح' },
            '500': { description: 'خطأ في السيرفر' },
          },
        },
        delete: {
          tags: ['📄 الشهادات (Certificates)'],
          summary: 'حذف شهادة',
          description: 'حذف شهادة نهائياً — يتم حذف الصورة من Cloudinary تلقائياً',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'MongoDB _id للشهادة',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'تم الحذف بنجاح',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/DeleteSuccess' } } },
            },
            '404': { description: 'الشهادة غير موجودة' },
            '401': { description: 'غير مصرّح' },
          },
        },
      },

      // ===== SEARCH BY LICENSE =====
      '/api/certificates/license/{licenseNumber}': {
        get: {
          tags: ['🔍 البحث (Search)'],
          summary: 'بحث برقم الرخصة',
          description: 'البحث عن آخر شهادة بنفس رقم الرخصة — يُستخدم للتعبئة التلقائية عند إنشاء شهادة جديدة',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'licenseNumber',
              in: 'path',
              required: true,
              description: 'رقم الرخصة',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'تم العثور على شهادة',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/Certificate' } } },
            },
            '404': { description: 'لا توجد شهادة بهذا الرقم' },
            '401': { description: 'غير مصرّح' },
          },
        },
      },

      // ===== NEXT NUMBER =====
      '/api/certificates-next-number': {
        get: {
          tags: ['🔍 البحث (Search)'],
          summary: 'الرقم التسلسلي التالي',
          description: 'جلب أعلى رقم شهادة صحية + 1 — يُستخدم لتحديد الرقم التسلسلي التالي تلقائياً',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'الرقم التالي',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/NextNumberResponse' } } },
            },
            '401': { description: 'غير مصرّح' },
          },
        },
      },

      // ===== BACKUP & RESTORE =====
      '/api/certificates-backup': {
        get: {
          tags: ['💾 النسخ الاحتياطي (Backup)'],
          summary: 'تحميل نسخة احتياطية',
          description: 'تحميل كل الشهادات كملف JSON — الملف يحتوي على مصفوفة من كل الشهادات',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'ملف JSON قابل للتحميل',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Certificate' },
                  },
                },
              },
            },
            '401': { description: 'غير مصرّح' },
          },
        },
      },
      '/api/certificates-restore': {
        post: {
          tags: ['💾 النسخ الاحتياطي (Backup)'],
          summary: 'استيراد نسخة احتياطية',
          description: 'رفع ملف JSON يحتوي على شهادات — الشهادات الموجودة (بنفس UUID) لن تُعدَّل، فقط الجديدة ستُضاف',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['file'],
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: 'ملف JSON يحتوي على مصفوفة شهادات',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'تم الاستيراد بنجاح',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/RestoreResponse' } } },
            },
            '400': { description: 'الملف غير صالح أو فارغ' },
            '401': { description: 'غير مصرّح' },
          },
        },
      },
    },
  },
  apis: [], // We defined everything inline above
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info { margin-bottom: 20px; }
      .swagger-ui .info .title { font-size: 28px; }
    `,
    customSiteTitle: 'Balady API Docs — الشهادات الصحية',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      tryItOutEnabled: true,
    },
  }));

  // JSON endpoint for the spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`📚 Swagger docs available at /api-docs`);
}

module.exports = { setupSwagger };
