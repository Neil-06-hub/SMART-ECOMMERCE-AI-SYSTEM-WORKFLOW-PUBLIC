import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { message as antMessage } from "antd";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function useChatSocket({ roomId, userId, userName, role }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomStatus, setRoomStatus] = useState(null);
  const [activeRooms, setActiveRooms] = useState([]); // Dành cho Admin

  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId) return;

    // Khởi tạo kết nối Socket.io
    const socketIo = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });

    socketRef.current = socketIo;
    setSocket(socketIo);

    socketIo.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket server");

      // Nếu là Admin, đăng ký nhận danh sách phòng hỗ trợ
      if (role === "admin") {
        socketIo.emit("admin_register");
        if (roomId && roomId !== "admin_lobby") {
          socketIo.emit("join_room", { roomId, userId, userName, role });
        }
      } else {
        // Nếu là Customer, tham gia phòng chat riêng biệt
        socketIo.emit("join_room", { roomId, userId, userName, role });
      }
    });

    socketIo.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket server");
    });

    // Lịch sử tin nhắn
    socketIo.on("message_history", (history) => {
      setMessages(history);
    });

    // Nhận tin nhắn mới
    socketIo.on("receive_message", (newMsg) => {
      setMessages((prev) => {
        // Tránh trùng lặp tin nhắn nếu có
        if (prev.some(m => m._id === newMsg._id)) return prev;
        return [...prev, newMsg];
      });
    });

    // Trạng thái phòng chat
    socketIo.on("room_status", (status) => {
      setRoomStatus(status);
    });

    // Tự động kích hoạt human handoff khi AI phát hiện hoặc khách gõ từ khóa
    socketIo.on("trigger_human_request", () => {
      socketIo.emit("request_human", { roomId });
    });

    // Dành cho Admin: Cập nhật danh sách phòng hỗ trợ hoạt động
    socketIo.on("active_rooms_list", (rooms) => {
      setActiveRooms(rooms);
    });

    socketIo.on("error_msg", (errStr) => {
      antMessage.error(errStr);
    });

    return () => {
      socketIo.disconnect();
    };
  }, [roomId, userId, userName, role]);

  // Gửi tin nhắn
  const sendMessage = useCallback((msgText) => {
    if (!socketRef.current || !msgText.trim()) return;

    socketRef.current.emit("send_message", {
      roomId,
      message: msgText,
      senderId: userId || null,
      senderName: userName || "Khách vãng lai",
      senderRole: role === "admin" ? "admin" : "customer",
    });
  }, [roomId, userId, userName, role]);

  // Khách hàng yêu cầu gặp nhân viên trực tiếp
  const requestHuman = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("request_human", { roomId });
  }, [roomId]);

  // Admin chấp nhận yêu cầu hỗ trợ
  const acceptRequest = useCallback((targetRoomId, adminId, adminName) => {
    if (!socketRef.current) return;
    socketRef.current.emit("accept_support_request", {
      roomId: targetRoomId,
      adminId,
      adminName,
    });
  }, []);

  // Đóng cuộc trò chuyện trực tiếp (chuyển lại về AI)
  const closeRoom = useCallback((targetRoomId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("close_support_room", {
      roomId: targetRoomId,
      role,
    });
  }, [role]);

  // Đồng bộ lại phòng khi Admin tham gia phòng khác
  const joinSupportRoom = useCallback((targetRoomId) => {
    if (!socketRef.current) return;
    socketRef.current.emit("join_room", {
      roomId: targetRoomId,
      userId,
      userName,
      role,
    });
  }, [userId, userName, role]);

  return {
    isConnected,
    messages,
    roomStatus,
    activeRooms,
    sendMessage,
    requestHuman,
    acceptRequest,
    closeRoom,
    joinSupportRoom,
  };
}
