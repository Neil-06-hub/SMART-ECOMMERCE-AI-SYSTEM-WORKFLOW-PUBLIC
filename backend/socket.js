const { Server } = require("socket.io");
const SupportRoom = require("./models/SupportRoom");
const Message = require("./models/Message");
const { chatWithAI } = require("./services/groq.service");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        process.env.CLIENT_URL || "http://localhost:3000",
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const sendActiveRoomsToAdmins = async () => {
    try {
      const rooms = await SupportRoom.find({ status: { $in: ["waiting", "active"] } }).sort({ updatedAt: -1 });
      io.to("admins").emit("active_rooms_list", rooms);
    } catch (err) {
      console.error("Error sending active rooms to admins:", err.message);
    }
  };

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Đăng ký làm Admin
    socket.on("admin_register", async () => {
      socket.join("admins");
      console.log(`👨‍💼 Socket ${socket.id} registered as Admin`);
      // Gửi danh sách phòng đang chờ/đang hoạt động cho Admin mới
      await sendActiveRoomsToAdmins();
    });

    // Tham gia phòng chat
    socket.on("join_room", async ({ roomId, userId, userName, role }) => {
      socket.join(roomId);
      console.log(`👥 Socket ${socket.id} joined room: ${roomId} as ${role}`);

      // Nếu là Admin, không tạo phòng mới, chỉ tham gia
      if (role === "admin") {
        return;
      }

      // Khách hàng hoặc Khách vãng lai: Tìm hoặc tạo phòng trong DB
      try {
        let room = await SupportRoom.findOne({ roomId });
        if (!room) {
          room = await SupportRoom.create({
            roomId,
            userId: userId || null,
            userName: userName || "Khách vãng lai",
            status: "bot",
          });
        }
        
        // Nạp và gửi lại lịch sử chat cũ
        const history = await Message.find({ roomId }).sort({ timestamp: 1 }).limit(100);
        socket.emit("message_history", history);
        
        // Đồng bộ trạng thái phòng về cho khách
        socket.emit("room_status", room);
      } catch (err) {
        console.error("Error in join_room:", err.message);
      }
    });

    // Nhận và phát tin nhắn
    socket.on("send_message", async ({ roomId, message, senderId, senderName, senderRole }) => {
      try {
        // 1. Lưu tin nhắn người dùng gửi vào MongoDB
        const savedMsg = await Message.create({
          roomId,
          senderId: senderId || null,
          senderName,
          senderRole,
          message,
        });

        // 2. Phát tin nhắn tới phòng chat
        io.to(roomId).emit("receive_message", savedMsg);

        // Cập nhật thời gian tương tác cuối của phòng
        await SupportRoom.findOneAndUpdate({ roomId }, { updatedAt: new Date() });

        // 3. Nếu ở chế độ Bot và tin nhắn từ phía Customer -> Gọi AI phản hồi
        const room = await SupportRoom.findOne({ roomId });
        if (room && room.status === "bot" && senderRole === "customer") {
          // Kiểm tra xem tin nhắn người dùng có chứa từ khóa gặp nhân viên trước không
          const lowerMsg = message.toLowerCase();
          const wantsHuman = lowerMsg.includes("gặp nhân viên") || 
                             lowerMsg.includes("nói chuyện với người") || 
                             lowerMsg.includes("gặp hỗ trợ") ||
                             lowerMsg.includes("nhân viên trực");

          if (wantsHuman) {
            // Kích hoạt luôn luồng human request
            socket.emit("trigger_human_request");
            return;
          }

          // Lấy 10 tin nhắn gần nhất để làm ngữ cảnh cho AI
          const recentMessages = await Message.find({ roomId }).sort({ timestamp: -1 }).limit(10);
          const history = recentMessages.reverse().map(m => ({
            role: m.senderRole === "customer" ? "user" : m.senderRole === "bot" ? "assistant" : "system",
            content: m.message,
          }));

          // Gọi Groq API tư vấn
          const botReply = await chatWithAI(history);

          // Lưu phản hồi của AI vào DB
          const savedBotMsg = await Message.create({
            roomId,
            senderName: "AI Assistant",
            senderRole: "bot",
            message: botReply,
          });

          // Phát tin nhắn AI trả lời về phòng chat
          io.to(roomId).emit("receive_message", savedBotMsg);

          // Kiểm tra nếu AI báo sẽ kết nối hỗ trợ
          if (botReply.includes("kết nối bạn với nhân viên") || botReply.includes("đợi trong giây lát")) {
            socket.emit("trigger_human_request");
          }
        } else if (room && (room.status === "active" || room.status === "waiting")) {
          // Nếu đang có nhân viên hỗ trợ, cập nhật lại danh sách phòng cho Admin
          await sendActiveRoomsToAdmins();
        }
      } catch (err) {
        console.error("Error in send_message:", err.message);
      }
    });

    // Yêu cầu gặp nhân viên (Human Handoff)
    socket.on("request_human", async ({ roomId }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        if (!room) return;

        // Kiểm tra xem có Admin nào online không (trong room "admins")
        const adminSockets = io.sockets.adapter.rooms.get("admins");
        const hasAdminOnline = adminSockets && adminSockets.size > 0;

        if (!hasAdminOnline) {
          // Báo bận ngay lập tức
          const systemMsg = "Hiện tại nhân viên hỗ trợ không trực tuyến. Bạn vui lòng tiếp tục trò chuyện với AI Assistant nhé.";
          const savedMsg = await Message.create({
            roomId,
            senderName: "AI Assistant",
            senderRole: "bot",
            message: systemMsg,
          });

          io.to(roomId).emit("receive_message", savedMsg);
          room.status = "bot";
          await room.save();
          socket.emit("room_status", room);
          return;
        }

        // Chuyển sang chế độ chờ duyệt
        room.status = "waiting";
        await room.save();
        io.to(roomId).emit("room_status", room);

        console.log(`📢 Room ${roomId} requested human. Status: waiting.`);
        await sendActiveRoomsToAdmins();

        // Thiết lập Timeout 30 giây để tự động chuyển về AI nếu không có Admin nào accept
        setTimeout(async () => {
          try {
            const checkRoom = await SupportRoom.findOne({ roomId });
            if (checkRoom && checkRoom.status === "waiting") {
              checkRoom.status = "bot";
              await checkRoom.save();

              const timeoutMsg = "Hiện tại tất cả nhân viên hỗ trợ đều đang bận. Bạn vui lòng tiếp tục trò chuyện với AI hoặc thử lại sau nhé.";
              const savedTimeoutMsg = await Message.create({
                roomId,
                senderName: "AI Assistant",
                senderRole: "bot",
                message: timeoutMsg,
              });

              io.to(roomId).emit("receive_message", savedTimeoutMsg);
              io.to(roomId).emit("room_status", checkRoom);
              
              // Cập nhật lại dashboard admin
              await sendActiveRoomsToAdmins();
            }
          } catch (err) {
            console.error("Error in request_human timeout handler:", err.message);
          }
        }, 30000);

      } catch (err) {
        console.error("Error in request_human:", err.message);
      }
    });

    // Admin Chấp nhận hỗ trợ
    socket.on("accept_support_request", async ({ roomId, adminId, adminName }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        if (!room) return;

        if (room.status !== "waiting") {
          socket.emit("error_msg", "Phòng này đã được nhân viên khác tiếp nhận hoặc đã đóng.");
          return;
        }

        // Đổi trạng thái sang active, gán admin
        room.status = "active";
        room.adminId = adminId;
        room.adminName = adminName;
        await room.save();

        // Cho socket của Admin tham gia phòng chat
        socket.join(roomId);

        // Lưu tin nhắn hệ thống báo Admin tham gia
        const systemMsg = `Nhân viên hỗ trợ ${adminName} đã tham gia cuộc trò chuyện trực tiếp.`;
        const savedMsg = await Message.create({
          roomId,
          senderName: "Hệ thống",
          senderRole: "admin",
          message: systemMsg,
        });

        io.to(roomId).emit("receive_message", savedMsg);
        io.to(roomId).emit("room_status", room);
        
        console.log(`✅ Admin ${adminName} accepted room ${roomId}`);
        await sendActiveRoomsToAdmins();
      } catch (err) {
        console.error("Error in accept_support_request:", err.message);
      }
    });

    // Đóng cuộc trò chuyện (Kết thúc hỗ trợ)
    socket.on("close_support_room", async ({ roomId, role }) => {
      try {
        const room = await SupportRoom.findOne({ roomId });
        if (!room) return;

        // Chuyển lại trạng thái bot
        room.status = "bot";
        room.adminId = null;
        room.adminName = null;
        await room.save();

        const systemMsg = "Cuộc trò chuyện trực tiếp đã kết thúc. Bạn đã được chuyển lại về trò chuyện với AI Assistant.";
        const savedMsg = await Message.create({
          roomId,
          senderName: "Hệ thống",
          senderRole: "bot",
          message: systemMsg,
        });

        io.to(roomId).emit("receive_message", savedMsg);
        io.to(roomId).emit("room_status", room);

        console.log(`⏹️ Room ${roomId} was closed by ${role}`);
        await sendActiveRoomsToAdmins();
      } catch (err) {
        console.error("Error in close_support_room:", err.message);
      }
    });

    // Ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
