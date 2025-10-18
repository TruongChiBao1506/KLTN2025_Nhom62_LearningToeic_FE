import io from 'socket.io-client';

// Socket service để quản lý kết nối Socket.io
class SocketService {
  constructor() {
    this.socket = null;
    this._isConnected = false;
    this.listeners = new Map(); // Map<event, Array<callback>>
  }

  // Khởi tạo kết nối Socket.io
  connect(userId) {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Lấy API URL từ environment hoặc default
    const API_URL = process.env.REACT_APP_URL || 'http://localhost:5000';

    this.socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.io server');
      this._isConnected = true;

      // Đăng ký user để nhận notifications
      if (userId) {
        this.socket.emit('register', { userId });
        console.log('👤 Registered user:', userId);
      }

      // Setup lại tất cả listeners đã đăng ký trước đó
      console.log('🔄 Setting up existing listeners...');
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket.on(event, callback);
          console.log(`✅ Listener setup for event: ${event}`);
        });
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket.io server:', reason);
      this._isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔌 Socket connection error:', error);
      this._isConnected = false;
    });

    return this.socket;
  }

  // Ngắt kết nối
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      console.log('🔌 Socket disconnected');
    }
  }

  // Gửi event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected, cannot emit:', event);
    }
  }

  // Lắng nghe event
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Nếu socket đã kết nối, setup listener ngay
    if (this.socket?.connected) {
      this.socket.on(event, callback);
      console.log(`✅ Listener setup immediately for event: ${event}`);
    }
  }

  // Hủy lắng nghe event
  off(event, callback) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
        if (this.socket?.connected) {
          this.socket.off(event, callback);
        }
      }
    }
  }

  // Kiểm tra trạng thái kết nối
  get isConnected() {
    return this._isConnected;
  }

  // Lấy socket instance
  getSocket() {
    return this.socket;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;