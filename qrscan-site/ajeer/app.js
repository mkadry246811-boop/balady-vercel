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
                console.error('Supabase error:', error);
                return this.getContractFromLocal(id);
            }
        }
        return this.getContractFromLocal(id);
    }

    // Save (Create or Update) contract
    static async saveContract(contract) {
        if (this.isSupabaseAvailable()) {
            try {
                // Clean up the contract object
                // Clean up the contract object - Use explicit checks to preserve empty strings
                const cleanContract = {
                    contract_type: contract.contractType !== undefined ? contract.contractType : contract.contract_type || 'تعاقد أجير',
                    contract_number: contract.contractNumber !== undefined ? contract.contractNumber : contract.contract_number,
                    worker_name: contract.workerName !== undefined ? contract.workerName : contract.worker_name,
                    worker_profession: contract.workerProfession !== undefined ? contract.workerProfession : contract.worker_profession,
                    worker_id_number: contract.workerIdNumber !== undefined ? contract.workerIdNumber : contract.worker_id_number,
                    worker_nationality: contract.workerNationality !== undefined ? contract.workerNationality : contract.worker_nationality,
                    provider_entity: contract.providerEntity !== undefined ? contract.providerEntity : contract.provider_entity,
                    provider_hr_id: contract.providerHrId !== undefined ? contract.providerHrId : contract.provider_hr_id,
                    beneficiary_entity: contract.beneficiaryEntity !== undefined ? contract.beneficiaryEntity : contract.beneficiary_entity,
                    beneficiary_hr_id: contract.beneficiaryHrId !== undefined ? contract.beneficiaryHrId : contract.beneficiary_hr_id,
                    contract_summary: contract.contractSummary !== undefined ? contract.contractSummary : contract.contract_summary,
                    start_date: contract.startDate !== undefined ? contract.startDate : contract.start_date,
                    end_date: contract.endDate !== undefined ? contract.endDate : contract.end_date,
                    work_locations: contract.workLocations !== undefined ? contract.workLocations : contract.work_locations,
                    is_blocked: contract.isBlocked !== undefined ? contract.isBlocked : contract.is_blocked || false,
                    blocked_reason: contract.blockedReason !== undefined ? contract.blockedReason : contract.blocked_reason || null
                };

                if (contract.id) {
                    // Update existing
                    const { data, error } = await supabaseClient
                        .from(this.TABLE_NAME)
                        .update(cleanContract)
                        .eq('id', contract.id)
                        .select()
                        .single();

                    if (error) throw error;
                    return this.normalizeContract(data);
                } else {
                    // Create new with retry logic for unique constraint violation
                    let isGeneratedNumber = false;
                    if (!cleanContract.contract_number) {
                        const nextNumber = await this.getNextContractNumber();
                        cleanContract.contract_number = 'WT' + String(nextNumber).padStart(8, '0');
                        isGeneratedNumber = true;
                    }

                    let attempts = 0;
                    const maxAttempts = 3;
                    let lastError = null;

                    while (attempts < maxAttempts) {
                        const { data, error } = await supabaseClient
                            .from(this.TABLE_NAME)
                            .insert([cleanContract])
                            .select()
                            .single();

                        if (error) {
                            // If it's a unique violation (23505) and we generated the number, retry
                            if (error.code === '23505' && isGeneratedNumber) {
                                attempts++;
                                // Try with a timestamp-based number to avoid collision on retry
                                const fallbackNumber = Date.now().toString().slice(-8);
                                cleanContract.contract_number = 'WT' + fallbackNumber;
                                lastError = error;
                                continue;
                            }
                            throw error;
                        }
                        
                        return this.normalizeContract(data);
                    }
                    
                    throw lastError || new Error("Failed to generate a unique contract number");
                }
            } catch (error) {
                console.error('Supabase save error:', error);
                alert('خطأ في حفظ البيانات: ' + error.message);
                throw error;
            }
        }
        return this.saveContractToLocal(contract);
    }

    // Delete contract
    static async deleteContract(id) {
        if (this.isSupabaseAvailable()) {
            try {
                const { error } = await supabaseClient
                    .from(this.TABLE_NAME)
                    .delete()
                    .eq('id', id);

                if (error) throw error;
            } catch (error) {
                console.error('Supabase delete error:', error);
                throw error;
            }
        } else {
            this.deleteContractFromLocal(id);
        }
    }

    // Normalize Supabase data to camelCase
    static normalizeContract(contract) {
        if (!contract) return null;

        // Handle contract_type - check for null, undefined, or empty string
        let contractType = 'تعاقد أجير'; // default
        if (contract.contract_type && contract.contract_type.trim() !== '') {
            contractType = contract.contract_type;
        } else if (contract.contractType && contract.contractType.trim() !== '') {
            contractType = contract.contractType;
        }

        return {
            id: contract.id,
            contractType: contractType,
            contractNumber: contract.contract_number || contract.contractNumber,
            workerName: contract.worker_name || contract.workerName,
            workerProfession: contract.worker_profession || contract.workerProfession,
            workerIdNumber: contract.worker_id_number || contract.workerIdNumber,
            workerNationality: contract.worker_nationality || contract.workerNationality,
            providerEntity: contract.provider_entity || contract.providerEntity,
            providerHrId: contract.provider_hr_id || contract.providerHrId,
            beneficiaryEntity: contract.beneficiary_entity || contract.beneficiaryEntity,
            beneficiaryHrId: contract.beneficiary_hr_id || contract.beneficiaryHrId,
            contractSummary: contract.contract_summary || contract.contractSummary,
            startDate: contract.start_date || contract.startDate,
            endDate: contract.end_date || contract.endDate,
            workLocations: contract.work_locations || contract.workLocations,
            isBlocked: contract.is_blocked !== undefined ? Boolean(contract.is_blocked) : Boolean(contract.isBlocked),
            blockedReason: contract.blocked_reason || contract.blockedReason || null,
            createdAt: contract.created_at || contract.createdAt
        };
    }

    // LocalStorage Fallback Methods
    static getContractsFromLocal() {
        const data = localStorage.getItem(this.STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    static getContractFromLocal(id) {
        const contracts = this.getContractsFromLocal();
        return contracts.find(c => c.id === id);
    }

    static saveContractToLocal(contract) {
        const contracts = this.getContractsFromLocal();

        if (contract.id) {
            const index = contracts.findIndex(c => c.id === contract.id);
            if (index !== -1) {
                contracts[index] = { ...contracts[index], ...contract };
            } else {
                contracts.push(contract);
            }
        } else {
            contract.id = this.generateId();
            contract.createdAt = new Date().toISOString();
            if (!contract.contractNumber) {
                // Get next sequential number from localStorage
                const nextNumber = this.getNextLocalContractNumber(contracts);
                contract.contractNumber = 'WT' + String(nextNumber).padStart(8, '0');
            }
            contracts.push(contract);
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
        return contract;
    }

    static deleteContractFromLocal(id) {
        let contracts = this.getContractsFromLocal();
        contracts = contracts.filter(c => c.id !== id);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
    }

    static generateId() {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // Get next sequential contract number from Supabase
    static async getNextContractNumber() {
        try {
            // Fetch the most recent contracts to determine the highest number
            const { data, error } = await supabaseClient
                .from(this.TABLE_NAME)
                .select('contract_number')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;

            if (data && data.length > 0) {
                let maxNumber = 0;
                data.forEach(item => {
                    if (item.contract_number && item.contract_number.startsWith('WT')) {
                        // Extract number from "WT00000001" format
                        const num = parseInt(item.contract_number.replace('WT', '')) || 0;
                        if (num > maxNumber) {
                            maxNumber = num;
                        }
                    }
                });
                return maxNumber > 0 ? maxNumber + 1 : 1;
            }
            return 1; // First contract
        } catch (error) {
            console.error('Error getting next contract number:', error);
            // Fallback to a large random number to avoid collisions if query fails
            return Math.floor(Math.random() * 9000000) + 1000000;
        }
    }

    // Get next sequential contract number from localStorage
    static getNextLocalContractNumber(contracts) {
        if (!contracts || contracts.length === 0) return 1;

        let maxNumber = 0;
        contracts.forEach(c => {
            if (c.contractNumber) {
                const num = parseInt(c.contractNumber.replace('WT', '')) || 0;
                if (num > maxNumber) maxNumber = num;
            }
        });
        return maxNumber + 1;
    }

    // Import contracts from a JSON backup file (upsert - skip existing IDs)
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

                    // Validate file type
                    if (parsed.type !== 'ajeer_contracts_backup') {
                        throw new Error('الملف غير متوافق - يجب أن يكون نسخة احتياطية من عقود أجير');
                    }

                    const records = parsed.data || [];
                    let imported = 0;
                    let skipped = 0;

                    if (this.isSupabaseAvailable()) {
                        // Get all existing IDs from Supabase
                        const { data: existing } = await supabaseClient
                            .from(this.TABLE_NAME)
                            .select('id');
                        const existingIds = new Set((existing || []).map(r => r.id));

                        for (const contract of records) {
                            if (!contract.id || existingIds.has(contract.id)) {
                                skipped++;
                                continue;
                            }
                            // Build clean record keeping original ID
                            const cleanContract = {
                                id: contract.id,
                                contract_type: contract.contractType || 'تعاقد أجير',
                                contract_number: contract.contractNumber,
                                worker_name: contract.workerName,
                                worker_profession: contract.workerProfession,
                                worker_id_number: contract.workerIdNumber,
                                worker_nationality: contract.workerNationality,
                                provider_entity: contract.providerEntity,
                                provider_hr_id: contract.providerHrId,
                                beneficiary_entity: contract.beneficiaryEntity,
                                beneficiary_hr_id: contract.beneficiaryHrId,
                                contract_summary: contract.contractSummary,
                                start_date: contract.startDate,
                                end_date: contract.endDate,
                                work_locations: contract.workLocations,
                                is_blocked: contract.isBlocked || false,
                                blocked_reason: contract.blockedReason || null
                            };
                            const { error } = await supabaseClient
                                .from(this.TABLE_NAME)
                                .insert([cleanContract]);
                            if (!error) imported++;
                            else { console.warn('Insert error:', error); skipped++; }
                        }
                    } else {
                        // LocalStorage fallback
                        const existing = this.getContractsFromLocal();
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

    // Backup all contracts as JSON file - with Save As dialog
    static async backupDatabase() {
        try {
            const contracts = await this.getContracts();
            const backupData = {
                type: 'ajeer_contracts_backup',
                version: '1.0',
                exportedAt: new Date().toISOString(),
                totalRecords: contracts.length,
                source: this.isSupabaseAvailable() ? 'supabase' : 'localstorage',
                data: contracts
            };

            const json = JSON.stringify(backupData, null, 2);

            const now = new Date();
            const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
            const timeStr = `${String(now.getHours()).padStart(2,'0')}-${String(now.getMinutes()).padStart(2,'0')}`;
            const filename = `ajeer_backup_${dateStr}_${timeStr}.json`;

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
                    return { success: true, count: contracts.length, filename: fileHandle.name };
                } catch (pickerErr) {
                    // User cancelled the dialog - don't throw
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

            return { success: true, count: contracts.length, filename };
        } catch (error) {
            console.error('Backup error:', error);
            throw error;
        }
    }
}

// Utility to format dates
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Common UI functions
function showToast(message, type = 'success') {
    if (typeof Swal !== 'undefined') {
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: type,
            title: message,
            showConfirmButton: false,
            timer: 3000
        });
    } else {
        alert(message);
    }
}

// Show database status on page load
window.addEventListener('DOMContentLoaded', () => {
    if (StorageManager.isSupabaseAvailable()) {
        console.log('🌐 Supabase Mode: Active');
    } else {
        console.log('💾 LocalStorage Mode: Active');
    }
});
