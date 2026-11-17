/**
 * Health Certificate Manager
 * Handles Supabase and LocalStorage for Health Certificates
 */

class HealthStorageManager {
    static STORAGE_KEY = 'ajeer_health_certs';
    static TABLE_NAME = 'health_certificates'; // Will create this table in Supabase

    // Check if Supabase is available
    static isSupabaseAvailable() {
        return typeof supabaseClient !== 'undefined' && supabaseClient !== null && isSupabaseEnabled;
    }

    // Get all certificates
    static async getCertificates() {
        if (this.isSupabaseAvailable()) {
            try {
                const { data, error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data.map(c => this.normalizeCertificate(c)) || [];
            } catch (error) {
                console.error('Supabase error:', error);
                return this.getCertificatesFromLocal();
            }
        }
        return this.getCertificatesFromLocal();
    }

    // Get single certificate by ID
    static async getCertificate(id) {
        if (this.isSupabaseAvailable()) {
            try {
                const { data, error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return this.normalizeCertificate(data);
            } catch (error) {
                console.error('Supabase error:', error);
                return this.getCertificateFromLocal(id);
            }
        }
        return this.getCertificateFromLocal(id);
    }

    // Save (Create or Update)
    static async saveCertificate(cert) {
        if (this.isSupabaseAvailable()) {
            try {
                const cleanCert = {
                    certificate_number: cert.certificateNumber,
                    issue_date: cert.issueDate,
                    issuer: cert.issuer,
                    expiry_date: cert.expiryDate,
                    holder_name: cert.holderName,
                    holder_id: cert.idn, // 'idn' from form name
                    gender: cert.gender,
                    nationality: cert.nationality,
                    profession: cert.profession,
                    program_name: cert.programName || null,
                    program_end_date: cert.programEndDate || null,
                    facility_name: cert.facilityName,
                    facility_license: cert.facilityLicense,
                    photo_url: cert.photoUrl || null,
                    is_disabled: cert.isDisabled || false
                };

                if (cert.id) {
                    // Update
                    const { data, error } = await supabaseClient
                        .from(this.TABLE_NAME)
                        .update(cleanCert)
                        .eq('id', cert.id)
                        .select()
                        .single();

                    if (error) throw error;
                    return this.normalizeCertificate(data);
                } else {
                    // Create
                    const { data, error } = await supabaseClient
                        .from(this.TABLE_NAME)
                        .insert([cleanCert])
                        .select()
                        .single();

                    if (error) throw error;
                    return this.normalizeCertificate(data);
                }
            } catch (error) {
                console.warn('Supabase save error - falling back to LocalStorage:', error);
                // Fall through to LocalStorage on network errors
            }
        }
        return this.saveCertificateToLocal(cert);
    }

    // Normalize
    static normalizeCertificate(cert) {
        if (!cert) return null;
        return {
            id: cert.id,
            certificateNumber: cert.certificate_number || cert.certificateNumber,
            issueDate: cert.issue_date || cert.issueDate,
            issuer: cert.issuer || cert.issuer,
            expiryDate: cert.expiry_date || cert.expiryDate,
            holderName: cert.holder_name || cert.holderName,
            idn: cert.holder_id || cert.idn,
            gender: cert.gender,
            nationality: cert.nationality,
            profession: cert.profession,
            programName: cert.program_name || cert.programName,
            programEndDate: cert.program_end_date || cert.programEndDate,
            facilityName: cert.facility_name || cert.facilityName,
            facilityLicense: cert.facility_license || cert.facilityLicense,
            photoUrl: cert.photo_url || cert.photoUrl,
            isDisabled: cert.is_disabled || cert.isDisabled || false,
            createdAt: cert.created_at || cert.createdAt
        };
    }

    // LocalStorage Fallback
    static getCertificatesFromLocal() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    static getCertificateFromLocal(id) {
        const certs = this.getCertificatesFromLocal();
        return certs.find(c => c.id === id);
    }

    static saveCertificateToLocal(cert) {
        const certs = this.getCertificatesFromLocal();
        if (cert.id) {
            const index = certs.findIndex(c => c.id === cert.id);
            if (index !== -1) {
                certs[index] = { ...certs[index], ...cert };
            } else {
                certs.push(cert);
            }
        } else {
            cert.id = this.generateId();
            cert.createdAt = new Date().toISOString();
            certs.push(cert);
        }
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(certs));
        return cert;
    }

    static async deleteCertificate(id) {
        if (this.isSupabaseAvailable()) {
            try {
                const { error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return true;
            } catch (error) {
                console.error('Supabase delete error:', error);
                throw error;
            }
        }

        // LocalStorage fallback
        const certs = this.getCertificatesFromLocal();
        const filtered = certs.filter(c => c.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }

    static generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Import certificates from a JSON backup file (upsert - skip existing IDs)
    static async importDatabase() {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json,application/json';

            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) { resolve({ imported: 0, skipped: 0 }); return; }

                try {
                    const text = await file.text();
                    const parsed = JSON.parse(text);

                    if (parsed.type !== 'health_certificates_backup') {
                        throw new Error('الملف غير متوافق - يجب أن يكون نسخة احتياطية من شهادات صحية');
                    }

                    const records = parsed.data || [];
                    let imported = 0;
                    let skipped = 0;

                    if (this.isSupabaseAvailable()) {
                        const { data: existing } = await supabaseClient
                            .from(this.TABLE_NAME)
                            .select('id');
                        const existingIds = new Set((existing || []).map(r => r.id));

                        for (const cert of records) {
                            if (!cert.id || existingIds.has(cert.id)) {
                                skipped++;
                                continue;
                            }
                            const cleanCert = {
                                id: cert.id,
                                certificate_number: cert.certificateNumber,
                                issue_date: cert.issueDate,
                                issuer: cert.issuer,
                                expiry_date: cert.expiryDate,
                                holder_name: cert.holderName,
                                holder_id: cert.idn,
                                gender: cert.gender,
                                nationality: cert.nationality,
                                profession: cert.profession,
                                program_name: cert.programName || null,
                                program_end_date: cert.programEndDate || null,
                                facility_name: cert.facilityName,
                                facility_license: cert.facilityLicense,
                                photo_url: cert.photoUrl || null,
                                is_disabled: cert.isDisabled || false
                            };
                            const { error } = await supabaseClient
                                .from(this.TABLE_NAME)
                                .insert([cleanCert]);
                            if (!error) imported++;
                            else { console.warn('Insert error:', error); skipped++; }
                        }
                    } else {
                        const existing = this.getCertificatesFromLocal();
                        const existingIds = new Set(existing.map(r => r.id));
                        const toAdd = records.filter(r => r.id && !existingIds.has(r.id));
                        skipped = records.length - toAdd.length;
                        const merged = [...existing, ...toAdd];
                        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merged));
                        imported = toAdd.length;
                    }

                    resolve({ imported, skipped });
                } catch (err) {
                    reject(err);
                }
            };

            input.click();
        });
    }

    // Backup all certificates as JSON file - with Save As dialog
    static async backupDatabase() {
        try {
            const certs = await this.getCertificates();
            const backupData = {
                type: 'health_certificates_backup',
                version: '1.0',
                exportedAt: new Date().toISOString(),
                totalRecords: certs.length,
                source: this.isSupabaseAvailable() ? 'supabase' : 'localstorage',
                data: certs
            };

            const json = JSON.stringify(backupData, null, 2);

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const timeStr = `${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
            const filename = `health_certs_backup_${dateStr}_${timeStr}.json`;

            // Try File System Access API (Save As dialog)
            if (window.showSaveFilePicker) {
                try {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: filename,
                        types: [{
                            description: 'ملف JSON للنسخة الاحتياطية',
                            accept: { 'application/json': ['.json'] }
                        }]
                    });
                    const writable = await fileHandle.createWritable();
                    await writable.write(json);
                    await writable.close();
                    return { success: true, count: certs.length, filename: fileHandle.name };
                } catch (pickerErr) {
                    // User cancelled the dialog
                    if (pickerErr.name === 'AbortError') {
                        return { success: false, cancelled: true, count: 0, filename };
                    }
                    // Other error - fall through to legacy download
                    console.warn('showSaveFilePicker failed, falling back:', pickerErr);
                }
            }

            // Fallback: auto-download (for Firefox and other unsupported browsers)
            const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            return { success: true, count: certs.length, filename };
        } catch (error) {
            console.error('Backup error:', error);
            throw error;
        }
    }

    // Toggle certificate status (enable/disable)
    static async toggleCertificateStatus(id, isDisabled) {
        if (this.isSupabaseAvailable()) {
            try {
                const { data, error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .update({ is_disabled: isDisabled })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return this.normalizeCertificate(data);
            } catch (error) {
                console.error('Supabase toggle status error:', error);
                throw error;
            }
        }

        // LocalStorage fallback
        const certs = this.getCertificatesFromLocal();
        const cert = certs.find(c => c.id === id);
        if (cert) {
            cert.isDisabled = isDisabled;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(certs));
            return cert;
        }
        return null;
    }
}
