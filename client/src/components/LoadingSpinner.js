import React from 'react';
import { Spin } from 'antd';

const LoadingSpinner = ({ tip = 'Đang tải...' }) => (
  <div style={{ textAlign: 'center', padding: 48 }}>
    <Spin size="large" tip={tip} />
  </div>
);

export const PageLoading = LoadingSpinner;
export const CardLoading = LoadingSpinner;
export default LoadingSpinner; 