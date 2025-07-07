import { useState } from 'react';

const useAPI = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const executeAPI = async (apiCall) => {
    setLoading(true);
    try {
      const result = await apiCall();
      setData(result.data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  return { data, loading, error, executeAPI };
};

export default useAPI; 