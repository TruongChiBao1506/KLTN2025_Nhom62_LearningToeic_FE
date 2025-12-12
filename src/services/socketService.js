import io from 'socket.io-client';

// Socket service để quản lý kết nối Socket.io
class SocketService {
  constructor() {
    this.socket = null;
    this._isConnected = false;
    this.listeners = new Map(); // Map<event, Set<callback>> - Use Set to prevent duplicates
    this.currentUserId = null; // Track current user to prevent duplicate connections
  }

  // Khởi tạo kết nối Socket.io
  connect(userId) {
    // 🔧 FIXED: Prevent duplicate connections for same user
    if (this.socket?.connected && this.currentUserId === userId) {
      console.log('🔌 Already connected for user:', userId);
      return this.socket;
    }

    // If different user, disconnect previous connection
    if (this.socket?.connected && this.currentUserId !== userId) {
      console.log('🔌 Disconnecting previous user:', this.currentUserId);
      this.disconnect();
    }

    this.currentUserId = userId;

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

      // 🔧 FIXED: Setup handlers only once using a dedicated method
      this._setupSocketHandlers();

      // ==================== NOTIFICATION LISTENER ====================
      // 🔧 FIXED: Backend emit event 'notification', không phải 'new_notification'
      this.socket.on('notification', (data) => {
        console.log('🔔 New notification received:', data);
        console.log('   Type:', data.type); // top-level type
        console.log('   Original Type (nested):', data.data?.originalType); // teacher_approved, etc.

        // Support multiple payload shapes - prefer top-level `type`, then nested `data.originalType`
        const resolvedType = data.type || data.originalType || data.data?.originalType || data.data?.type;
        console.log('   Resolved Type:', resolvedType);

        // Normalized payload for listeners
        const normalized = {
          ...data,
          payload: data.data || data.payload || {}
        };

        if (resolvedType) {
          switch (resolvedType) {
            // ==================== TEACHER REQUEST NOTIFICATIONS ====================
            case 'teacher_request':
              this._emitToListeners('new_teacher_request', normalized);
              this._emitToListeners('new_pending_content', normalized); // Update sidebar badge
              break;
            case 'teacher_approved':
              this._emitToListeners('teacher_request_approved', normalized);
              break;
            case 'teacher_rejected':
              this._emitToListeners('teacher_request_rejected', normalized);
              break;

            // ==================== CONTENT APPROVAL NOTIFICATIONS ====================
            case 'content_pending':
              this._emitToListeners('new_pending_content', normalized);
              this._emitToListeners('content_pending', normalized);
              break;
            case 'content_approved':
              this._emitToListeners('content_approved', normalized);
              this._emitToListeners('new_pending_content', normalized); // Update sidebar badge (decrement)
              break;
            case 'content_rejected':
              this._emitToListeners('content_rejected', normalized);
              this._emitToListeners('new_pending_content', normalized); // Update sidebar badge (decrement)
              break;
            case 'content_withdrawn':
              // A teacher has withdrawn submitted content, may reduce pending counts
              this._emitToListeners('content_withdrawn', normalized);
              this._emitToListeners('new_pending_content', normalized); // Update sidebar badge (decrement)
              break;

            // ==================== USER ROLE NOTIFICATIONS ====================
            case 'role_promoted':
              this._emitToListeners('role_promoted', normalized);
              this._emitToListeners('user_role_changed', normalized);
              break;
            case 'role_demoted':
              this._emitToListeners('role_demoted', normalized);
              this._emitToListeners('user_role_changed', normalized);
              break;

            default:
              console.log('Unknown notification type:', resolvedType);
          }
        }

        // Check mapped type (achievement/system/reminder) using top-level `data.type`
        if (data.type === 'achievement') {
          this._emitToListeners('new_achievement', normalized);
        } else if (data.type === 'system') {
          this._emitToListeners('system_notification', normalized);
        } else if (data.type === 'reminder') {
          this._emitToListeners('reminder_notification', normalized);
        }

        // Always emit the generic new_notification event
        this._emitToListeners('new_notification', normalized);
      });

      // ==================== OTHER BACKEND EVENTS ====================
      
      // Backend có thể emit 'registered' để confirm registration
      this.socket.on('registered', (data) => {
        console.log('✅ Registration confirmed by server:', data);
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
      this.currentUserId = null;
      console.log('🔌 Socket disconnected');
      
      // 🔧 FIXED: Clear all listeners on disconnect
      this.listeners.forEach((callbacks, event) => {
        console.log(`🧹 Clearing ${callbacks.size} listener(s) for event: ${event}`);
      });
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
    // 🔧 FIXED: Use Set instead of Array to prevent duplicate callbacks
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    const callbacks = this.listeners.get(event);
    
    // Check if callback already exists
    if (callbacks.has(callback)) {
      console.log(`⚠️ Callback already registered for event: ${event}`);
      return;
    }
    
    callbacks.add(callback);
    console.log(`➕ Registered callback for event: ${event} (total: ${callbacks.size})`);

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
      eventListeners.delete(callback);
      console.log(`➖ Removed callback for event: ${event} (remaining: ${eventListeners.size})`);
      if (this.socket?.connected) {
        this.socket.off(event, callback);
      }
    }
  }

  // 🔧 NEW: Remove all listeners for an event
  offAll(event) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      console.log(`🧹 Removing all ${eventListeners.size} listener(s) for event: ${event}`);
      eventListeners.forEach(callback => {
        if (this.socket?.connected) {
          this.socket.off(event, callback);
        }
      });
      this.listeners.delete(event);
    }
  }

  // Internal method to emit events to registered listeners
  _emitToListeners(event, data) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      // 🔧 FIXED: Use .size instead of .length for Set
      console.log(`📢 Emitting to ${eventListeners.size} listener(s) for event: ${event}`);
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
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

  // 🔧 NEW: Setup socket event handlers (called once on connect)
  _setupSocketHandlers() {
    if (!this.socket) return;

    // Setup lại tất cả listeners đã đăng ký trước đó
    console.log('🔄 Setting up existing listeners...');
    this.listeners.forEach((callbacks, event) => {
      callbacks.forEach(callback => {
        this.socket.on(event, callback);
      });
      console.log(`✅ Setup ${callbacks.size} listener(s) for event: ${event}`);
    });
  }

  // 🔧 NEW: Debug helper to check listener counts
  getListenerCounts() {
    const counts = {};
    this.listeners.forEach((callbacks, event) => {
      counts[event] = callbacks.size;
    });
    return counts;
  }
}

// Singleton instance
const socketService = new SocketService();

export default socketService;