'use client';

import { Card, Col, Row, Skeleton } from 'antd';

export default function AIProductSkeleton({ count = 4 }) {
  return (
    <Row gutter={[24, 24]}>
      {Array.from({ length: count }).map((_, index) => (
        <Col key={index} xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{
              borderRadius: 24,
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
            }}
            bodyStyle={{ padding: 18 }}
          >
            <Skeleton.Image active style={{ width: '100%', height: 260, borderRadius: 18 }} />
            <Skeleton active title={{ width: '70%' }} paragraph={{ rows: 4 }} style={{ marginTop: 18 }} />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
