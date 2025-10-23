import { callPrimaryAppAPI } from '../../../../services/api';

export const useAPITest = () => {
  const testUserInfo = async () => {
    try {
      const result = await callPrimaryAppAPI('/api/auth/me', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const testHealthCheck = async () => {
    try {
      const result = await callPrimaryAppAPI('/api/remotion/health', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const testRootEndpoint = async () => {
    try {
      const result = await callPrimaryAppAPI('/', null, 'GET');
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    testUserInfo,
    testHealthCheck,
    testRootEndpoint
  };
};
