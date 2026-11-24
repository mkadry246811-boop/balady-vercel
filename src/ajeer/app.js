/**
 * Ajeer Frontend - Core Application Logic
 * Supports both Supabase and LocalStorage
 */

class StorageManager {
    static STORAGE_KEY = 'ajeer_contracts';
    static TABLE_NAME = 'contracts';

    // Check if Supabase is available
    static isSupabaseAvailable() {
        return typeof supabaseClient !== 'undefined' && supabaseClient !== null && isSupabaseEnabled;
    }

    // Get all contracts
    static async getContracts() {
        if (this.isSupabaseAvailable()) {
            try {
                const { data, error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                return data.map(c => this.normalizeContract(c)) || [];
            } catch (error) {
                console.error('Supabase error:', error);
                return this.getContractsFromLocal();
            }
        }
        return this.getContractsFromLocal();
    }

    // Get single contract by ID
    static async getContract(id) {
        if (this.isSupabaseAvailable()) {
            try {
                const { data, error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return this.normalizeContract(data);
            } catch (error) {
                ¶»§q«^