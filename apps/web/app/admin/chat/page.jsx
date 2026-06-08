'use client';

import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Tabs, List, Badge, Avatar, Button, Input, Spin, Empty, Result } from 'antd';
import { 
  CustomerServiceOutlined, MessageOutlined, SendOutlined, 
  CheckOutlined, CloseCircleOutlined, UserOutlined, ClockCircleOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useStore';
import useChatSocket from '@/hooks/useChatSocket';

export default function AdminChatPage() {
  const { user } = useAuthStore();
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const chatEndRef = useRef(null);

  // Kết nối socket vào lobby admin
  const {
    isConnected,
    messages,
    activeRooms,
    sendMessage,
    acceptRequest,
    closeRoom,
  } = useChatSocket({
    roomId: selectedRoom ? selectedRoom.roomId : 'admin_lobby',
    userId: user?._id,
    userName: user?.name || 'Admin Support',
    role: 'admin',
  });

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim() || !selectedRoom) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Chia danh sách các phòng thành Chờ duyệt (waiting) và Đang hỗ trợ (active)
  const waitingRooms = activeRooms.filter(room => room.status === 'waiting');
  const ongoingRooms = activeRooms.filter(room => room.status === 'active');

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
  };

  const handleAccept = (room) => {
    if (!user) return;
    acceptRequest(room.roomId, user._id, user.name);
    // Chuyển sang phòng chat vừa nhận
    setSelectedRoom({
      ...room,
      status: 'active',
      adminId: user._id,
      adminName: user.name
    });
  };

  const handleClose = (room) => {
    closeRoom(room.roomId);
    if (selectedRoom?.roomId === room.roomId) {
      setSelectedRoom(null);
    }
  };

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 800, color: '#1e293b' }}>Hỗ trợ khách hàng trực tuyến</h2>
          <span style={{ fontSize: 13, color: '#64748b' }}>Trò chuyện và hỗ trợ kỹ thuật theo thời gian thực</span>
        </div>
        <Badge 
          status={isConnected ? "success" : "error"} 
          text={isConnected ? "Máy chủ Socket: Đang hoạt động" : "Máy chủ Socket: Lỗi kết nối"} 
          style={{ fontWeight: 600 }}
        />
      </div>

      <Row gutter={[16, 16]} style={{ flex: 1, minHeight: 0 }}>
        {/* Cột bên trái: Danh sách phòng chat */}
        <Col xs={24} md={8} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card 
            styles={{ body: { padding: '12px', height: '100%', display: 'flex', flexDirection: 'column' } }} 
            style={{ height: '100%', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}
          >
            <Tabs defaultActiveKey="waiting" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
              {/* Tab: Chờ duyệt */}
              <Tabs.TabPane 
                tab={
                  <span>
                    Chờ duyệt
                    {waitingRooms.length > 0 && (
                      <Badge count={waitingRooms.length} style={{ marginLeft: 8, backgroundColor: '#f97316' }} />
                    )}
                  </span>
                } 
                key="waiting"
              >
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 280px)' }}>
                  <List
                    dataSource={waitingRooms}
                    renderItem={room => (
                      <List.Item
                        style={{
                          padding: '12px',
                          borderRadius: 12,
                          background: '#fffbeb',
                          border: '1px solid #fef3c7',
                          marginBottom: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar style={{ backgroundColor: '#f59e0b' }} icon={<UserOutlined />} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#92400e' }}>{room.userName}</div>
                            <div style={{ fontSize: 11, color: '#b45309' }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              Chờ kết nối...
                            </div>
                          </div>
                        </div>
                        <Button 
                          type="primary" 
                          size="small" 
                          icon={<CheckOutlined />}
                          onClick={() => handleAccept(room)}
                          style={{ background: '#f59e0b', borderColor: '#f59e0b', borderRadius: 6 }}
                        >
                          Chấp nhận
                        </Button>
                      </List.Item>
                    )}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có yêu cầu chờ duyệt" /> }}
                  />
                </div>
              </Tabs.TabPane>

              {/* Tab: Đang hỗ trợ */}
              <Tabs.TabPane 
                tab={
                  <span>
                    Đang hỗ trợ
                    {ongoingRooms.length > 0 && (
                      <Badge count={ongoingRooms.length} style={{ marginLeft: 8, backgroundColor: '#0d9488' }} />
                    )}
                  </span>
                } 
                key="ongoing"
              >
                <div style={{ overflowY: 'auto', flex: 1, maxHeight: 'calc(100vh - 280px)' }}>
                  <List
                    dataSource={ongoingRooms}
                    renderItem={room => {
                      const isSelected = selectedRoom?.roomId === room.roomId;
                      const isAssignedToMe = room.adminId === user?._id;

                      return (
                        <List.Item
                          onClick={() => handleSelectRoom(room)}
                          style={{
                            padding: '12px',
                            borderRadius: 12,
                            background: isSelected ? '#ccfbf1' : '#f8fafc',
                            border: isSelected ? '1px solid #99f6e4' : '1px solid #e2e8f0',
                            marginBottom: 8,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <Avatar style={{ backgroundColor: '#0d9488' }} icon={<UserOutlined />} />
                              <div>
                                <div style={{ fontWeight: 700, color: '#1e293b' }}>{room.userName}</div>
                                <div style={{ fontSize: 11, color: '#64748b' }}>
                                  Hỗ trợ bởi: {isAssignedToMe ? 'Bạn' : room.adminName}
                                </div>
                              </div>
                            </div>
                            <Button 
                              type="text" 
                              danger 
                              size="small"
                              icon={<CloseCircleOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClose(room);
                              }}
                            />
                          </div>
                        </List.Item>
                      );
                    }}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có phòng đang chat" /> }}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Cột bên phải: Khung chat chi tiết */}
        <Col xs={24} md={16} style={{ height: '100%' }}>
          {selectedRoom ? (
            <Card 
              styles={{ body: { padding: 0, height: '100%', display: 'flex', flexDirection: 'column' } }} 
              style={{ height: '100%', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.02)', overflow: 'hidden' }}
            >
              {/* Header khung chat */}
              <div 
                style={{ 
                  padding: '16px 24px', 
                  borderBottom: '1px solid #e2e8f0', 
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar style={{ backgroundColor: '#0d9488' }} icon={<UserOutlined />} />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 700, color: '#1e293b' }}>{selectedRoom.userName}</h4>
                    <span style={{ fontSize: 12, color: '#64748b' }}>
                      Mã phòng: {selectedRoom.roomId}
                    </span>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  danger 
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleClose(selectedRoom)}
                  style={{ borderRadius: 8 }}
                >
                  Kết thúc hỗ trợ
                </Button>
              </div>

              {/* Danh sách tin nhắn */}
              <div 
                style={{ 
                  flex: 1, 
                  padding: '24px', 
                  background: '#f1f5f9', 
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12
                }}
              >
                {messages.map((msg, idx) => {
                  // Khách hàng gửi thì hiển thị bên trái, Admin gửi thì hiển thị bên phải
                  const isMe = msg.senderRole === 'admin';
                  const isSystem = msg.senderName === 'Hệ thống';

                  if (isSystem) {
                    return (
                      <div key={msg._id || idx} style={{ alignSelf: 'center', margin: '6px 0', fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
                        {msg.message}
                      </div>
                    );
                  }

                  return (
                    <div 
                      key={msg._id || idx}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                      }}
                    >
                      <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2, marginLeft: 4 }}>
                        {msg.senderName} ({msg.senderRole})
                      </span>
                      <div
                        style={{
                          padding: '10px 16px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe ? '#0d9488' : 'white',
                          color: isMe ? 'white' : '#1e293b',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          fontSize: 13,
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>

              {/* Ô nhập tin nhắn gửi */}
              <div style={{ padding: '16px 24px', background: 'white', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <Input
                    placeholder="Nhập tin nhắn hỗ trợ trực tiếp..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{ borderRadius: 8, height: 40 }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    style={{ background: '#0d9488', borderColor: '#0d9488', borderRadius: 8, height: 40, width: 90 }}
                  >
                    Gửi
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card 
              style={{ height: '100%', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}
            >
              <Result
                icon={<MessageOutlined style={{ color: '#0d9488', fontSize: 60 }} />}
                title="Khung Hỗ Trợ Chưa Hoạt Động"
                subTitle="Hãy chọn một phòng chat có trạng thái Chờ duyệt hoặc Đang hỗ trợ ở danh sách bên trái để bắt đầu nhắn tin với khách hàng."
              />
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
}
