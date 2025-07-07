import { useState, useEffect, useRef } from 'react';

export const useRealTime = (endpoint, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);
  
  const { 
    pollInterval = 30000, // 30 seconds
    useWebSocket = false,
    onUpdate,
    onError,
    autoConnect = true
  } = options;

  const connect = () => {
    if (useWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setConnected(false);
  };

  const connectWebSocket = () => {
    try {
      const wsUrl = `ws://localhost:3001/ws${endpoint}`;
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        setConnected(true);
        setError(null);
        setLoading(false);
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const newData = JSON.parse(event.data);
          setData(newData);
          onUpdate?.(newData);
        } catch (err) {
          setError('Failed to parse WebSocket message');
          onError?.(err);
        }
      };
      
      wsRef.current.onclose = () => {
        setConnected(false);
        // Attempt to reconnect after 5 seconds
        setTimeout(connect, 5000);
      };
      
      wsRef.current.onerror = (err) => {
        setError('WebSocket connection error');
        onError?.(err);
      };
    } catch (err) {
      setError('Failed to connect to WebSocket');
      onError?.(err);
    }
  };

  const startPolling = () => {
    const poll = async () => {
      try {
        const response = await fetch(`/api${endpoint}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const newData = await response.json();
        setData(newData);
        setError(null);
        setConnected(true);
        onUpdate?.(newData);
      } catch (err) {
        setError(err.message);
        setConnected(false);
        onError?.(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    intervalRef.current = setInterval(poll, pollInterval);
  };

  const refresh = () => {
    if (useWebSocket && wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'refresh' }));
    } else {
      startPolling();
    }
  };

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [endpoint, useWebSocket, pollInterval, autoConnect]);

  return {
    data,
    loading,
    error,
    connected,
    connect,
    disconnect,
    refresh
  };
};
