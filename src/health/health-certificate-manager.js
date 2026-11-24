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
                ¶»§q«^