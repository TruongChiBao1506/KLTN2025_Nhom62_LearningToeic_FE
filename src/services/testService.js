import axiosClient from "./axiosClient";

class TestService {
  constructor(baseUrl = "/tests") {
    this.baseUrl = baseUrl;
  }

  async create(sectionId, data) {
    // Add sectionId to data
    data.sectionId = sectionId;
    const response = await axiosClient.post(`${this.baseUrl}`, data);
    return response;
  }

  async all() {
    const response = await axiosClient.get(`${this.baseUrl}`);
    return response;
  }

  async get(id) {
    const response = await axiosClient.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async update(id, data) {
    const response = await axiosClient.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id) {
    const response = await axiosClient.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async getTestsBySection(sectionId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-section/${sectionId}`
    );
    return response;
  }

  async updateStatus(testId, newStatus) {
    const response = await axiosClient.put(`${this.baseUrl}/${testId}/status`, {
      status: newStatus,
    });
    return response.data;
  }

  async addOrUpdateQuestionToTest(testId, questionIds) {
    console.log('📤 API Request:', {
      endpoint: `${this.baseUrl}/${testId}/add-questions`,
      method: 'PUT',
      payload: { questionIds },
      count: questionIds.length
    });

    try {
      const response = await axiosClient.put(
        `${this.baseUrl}/${testId}/add-questions`,
        { questionIds } // ✅ Gửi đúng format: { questionIds: [...] }
      );
      
      console.log('📥 API Response:', response);
      return response;
      
    } catch (error) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      throw error;
    }
  }
  async getQuestionsByTestId(testId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/${testId}/questions`
    );
    return response;
  }

  async getEnableTestsBySection(sectionId) {
    const response = await axiosClient.get(
      `${this.baseUrl}/by-section/${sectionId}/enable`
    );
    return response;
  }

  async incrementParticipants(testId) {
    // Backend does not provide an atomic increment endpoint by default, so we
    // read the current test and then update the `testParticipants` value.
    // NOTE: This approach is NOT atomic and may lead to race conditions if
    // multiple clients call this concurrently. A backend endpoint such as
    // PUT /tests/:id/participants/increment or a PATCH with atomic operators
    // is recommended to avoid lost increments.
    if (!testId) throw new Error('Invalid test id for incrementParticipants');
    let test;
    try {
      test = await this.get(testId);
    } catch (err) {
      // Provide clearer message for 404
      if (err?.response?.status === 404) {
        throw new Error(`Test not found: ${testId}`);
      }
      throw err;
    }
    const current = (test.testParticipants || 0) + 1;
    // Try the new backend endpoint: PUT /tests/:id/update-participants
    try {
      const response = await axiosClient.put(`${this.baseUrl}/${testId}/update-participants`, { participants: current });
      return response;
    } catch (err) {
      // If the new endpoint is not available, fallback to the old `update` endpoint
      console.warn('update-participants endpoint failed or not available, falling back to update():', err?.message || err);
      const updated = await this.update(testId, { testParticipants: current });
      return updated;
    }
  }
}

const testService = new TestService();
export default testService;
