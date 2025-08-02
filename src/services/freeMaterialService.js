import axiosClient from './axiosClient';

class FreeMaterialService {
    constructor(baseUrl = "/free-materials") {
        this.baseUrl = baseUrl;
    }

    async create(data) {
        return (await axiosClient.post(`${this.baseUrl}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })).data;
    }

    async all() {
        return (await axiosClient.get(`${this.baseUrl}`));
    }

    async allActive() {
        return (await axiosClient.get(`${this.baseUrl}/enable`));
    }

    async get(id) {
        return (await axiosClient.get(`${this.baseUrl}/${id}`));
    }

    async update(id, data) {
        return (await axiosClient.put(`${this.baseUrl}/${id}`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })).data;
    }

    async delete(id) {
        return (await axiosClient.delete(`${this.baseUrl}/${id}`));
    }

    async updateStatus(materialId, newStatus) {
        return await axiosClient.put(`${this.baseUrl}/${materialId}/status`, {
            status: newStatus
        });
    }

    async getStats() {
        return (await axiosClient.get(`${this.baseUrl}/stats`));
    }

    // Download file method
    async downloadFile(fileName) {
        try {
            // Try different download endpoint variations
            let downloadUrl = `${this.baseUrl}/download/${fileName}`;

            const response = await axiosClient.get(downloadUrl, {
                responseType: 'blob'
            });

            // Create blob and download
            const blob = new Blob([response.data], {
                type: response.headers['content-type'] || 'application/pdf'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            // Use original filename if available, otherwise use provided fileName
            const downloadFileName = fileName.includes('.') ? fileName : `${fileName}.pdf`;
            link.download = downloadFileName;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            return response;
        } catch (error) {
            console.error('Download error:', error);
            throw error;
        }
    }
    async countTotalFreeMaterials() {
        return (await axiosClient.get(`${this.baseUrl}/total`));
    }
}

const freeMaterialService = new FreeMaterialService();
export default freeMaterialService;