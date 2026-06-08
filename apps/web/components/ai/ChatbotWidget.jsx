'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Avatar, Badge, Spin } from 'antd';
import { 
  MessageFilled, CloseOutlined, SendOutlined, 
  CustomerServiceOutlined, RobotOutlined, UserOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '@/store/useStore';
import useChatSocket from '@/hooks/useChatSocket';

export default function ChatbotWidget() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [guestId, setGuestId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const messagesEndRef = useRef(null);

  // Sinh ID khách vãng lai nếu chưa đăng nhập
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let gid = localStorage.getItem('chat_guest_id');
      if (!gid) {
        gid = 'guest_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('chat_guest_id', gid);
      }
      setGuestId(gid);
    }
  }, []);

  // Admin không hiện widget bong bóng này trên trang của họ (đã có trang chat riêng)
  if (user?.role === 'admin') {
    return null;
  }

  const roomId = user?._id || guestId;
  const userName = user?.name || 'Khách vãng lai';
  const role = 'customer';

  // Khởi tạo Hook Socket
  const {
    isConnected,
    messages,
    roomStatus,
    sendMessage,
    requestHuman,
    closeRoom,
  } = useChatSocket({
    roomId,
    userId: user?._id || null,
    userName,
    role,
  });

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  // Xác định trạng thái phòng chat
  const status = roomStatus?.status || 'bot'; // 'bot' | 'waiting' | 'active'

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999 }}>
      {/* Nút bong bóng Chat nổi */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.4)',
          color: 'white',
          fontSize: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CloseOutlined />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageFilled />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Cửa sổ Chat Panel */}
      <AnimatePresence>
        {isOpen && roomId && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: 80,
              right: 0,
              width: 380,
              height: 550,
              borderRadius: 24,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar 
                  size={38} 
                  style={{ background: status === 'active' ? '#0d9488' : '#f97316' }}
                  icon={status === 'active' ? <UserOutlined /> : <RobotOutlined />}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'white' }}>
                    {status === 'active' ? `NV ${roomStatus.adminName}` : 'SmartShop AI Assistant'}
                  </h4>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Badge status={isConnected ? "success" : "default"} style={{ transform: 'scale(0.8)' }} />
                    {status === 'active' ? 'Live Support' : status === 'waiting' ? 'Đang kết nối...' : 'Trực tuyến'}
                  </span>
                </div>
              </div>

              {/* Nút thoát Human Mode quay về AI */}
              {status === 'active' && (
                <Button 
                  type="text" 
                  size="small" 
                  onClick={() => closeRoom(roomId)}
                  style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                >
                  Rời Live Chat
                </Button>
              )}
            </div>

            {/* Khung tin nhắn */}
            <div
              style={{
                flex: 1,
                padding: '16px 20px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                background: '#f8fafc',
              }}
            >
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', padding: '0 20px' }}>
                  <RobotOutlined style={{ fontSize: 32, color: '#f97316', marginBottom: 12 }} />
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>
                    Xin chào! Tôi có thể giúp gì cho bạn hôm nay? Nhập yêu cầu để bắt đầu tư vấn.
                  </p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.senderRole === 'customer';
                  const isSystem = msg.senderName === 'Hệ thống';

                  if (isSystem) {
                    return (
                      <div key={msg._id || idx} style={{ alignSelf: 'center', margin: '4px 0', fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
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
                        maxWidth: '80%',
                      }}
                    >
                      {/* Tên người gửi */}
                      {!isMe && (
                        <span style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2, marginLeft: 4 }}>
                          {msg.senderName}
                        </span>
                      )}
                      
                      {/* Bong bóng tin nhắn */}
                      <div
                        style={{
                          padding: '10px 14px',
                          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          background: isMe 
                            ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' 
                            : msg.senderRole === 'admin' 
                              ? '#ccfbf1' 
                              : '#ffffff',
                          color: isMe 
                            ? 'white' 
                            : '#1e293b',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                          border: isMe ? 'none' : '1px solid rgba(0,0,0,0.04)',
                          fontSize: 13,
                          lineHeight: 1.5,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {msg.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Trạng thái Chờ Admin duyệt */}
            {status === 'waiting' && (
              <div
                style={{
                  padding: '24px 20px',
                  background: '#fffbeb',
                  borderTop: '1px solid #fde68a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'center',
                }}
              >
                <Spin indicator={<CustomerServiceOutlined style={{ fontSize: 24, color: '#d97706' }} spin />} />
                <div>
                  <h5 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                    Đang kết nối với nhân viên...
                  </h5>
                  <p style={{ margin: '4px 0 0', fontSize: 11, color: '#b45309' }}>
                    Hệ thống đang tìm kiếm nhân viên trực tuyến để hỗ trợ bạn trực tiếp.
                  </p>
                </div>
                <Button 
                  size="small" 
                  danger 
                  onClick={() => closeRoom(roomId)}
                  style={{ borderRadius: 8 }}
                >
                  Hủy và quay lại AI
                </Button>
              </div>
            )}

            {/* Khu vực nhập liệu (Footer) */}
            {status !== 'waiting' && (
              <div
                style={{
                  padding: '12px 16px',
                  background: 'white',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Thanh kết nối nhân viên (nếu đang ở chế độ bot) */}
                {status === 'bot' && (
                  <Button
                    type="dashed"
                    block
                    icon={<CustomerServiceOutlined />}
                    onClick={requestHuman}
                    style={{
                      borderColor: '#f97316',
                      color: '#f97316',
                      fontWeight: 600,
                      borderRadius: 10,
                      height: 34,
                      fontSize: 12,
                    }}
                  >
                    Gặp nhân viên hỗ trợ
                  </Button>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <Input
                    placeholder="Nhập tin nhắn..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{
                      borderRadius: 12,
                      background: '#f1f5f9',
                      border: 'none',
                      padding: '8px 12px',
                    }}
                  />
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<SendOutlined />}
                    onClick={handleSend}
                    style={{
                      background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                      border: 'none',
                      width: 36,
                      height: 36,
                      minWidth: 36,
                    }}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
