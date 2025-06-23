import axios from "axios";
import { API_URL } from "../config";

const getTotalStudyTime = async () => {
  try {
    const response = await axios.get(`${API_URL}/learner/progress/study-time`);
    return response.data;
  } catch (error) {
    console.error("Error fetching study time:", error);
    throw error;
  }
};

const getCertificatesCount = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/learner/progress/certificates`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching certificates:", error);
    throw error;
  }
};

const getSkillPerformance = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/learner/progress/skill-performance`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching skill performance:", error);
    throw error;
  }
};

const updateStudyTime = async (timeData) => {
  try {
    const response = await axios.post(
      `${API_URL}/learner/progress/update-time`,
      timeData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating study time:", error);
    throw error;
  }
};

const getLearningPath = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/learner/progress/learning-path`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching learning path:", error);
    throw error;
  }
};

const learnerProgressService = {
  getTotalStudyTime,
  getCertificatesCount,
  getSkillPerformance,
  updateStudyTime,
  getLearningPath,
};

export default learnerProgressService;
