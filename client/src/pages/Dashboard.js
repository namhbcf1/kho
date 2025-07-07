import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

export default function Dashboard() {
  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Card>
        <p>Welcome to the POS Dashboard!</p>
      </Card>
    </div>
  )
} 