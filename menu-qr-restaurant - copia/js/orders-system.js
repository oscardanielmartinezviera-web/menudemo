// ============================================
// SISTEMA DE PEDIDOS
// Gestiona envío y recepción de pedidos
// ============================================

var OrdersSystem = {
    orders: [],
    listeners: [],
    
    config: {
        storageKey: 'restaurant-orders',
        enableLocalStorage: true,
        enableNotifications: true,
        notificationSound: true,
        autoRefresh: true,
        refreshInterval: 3000
    },
    
    // Inicializar
    init: function(userConfig) {
        if (userConfig) Object.assign(this.config, userConfig);
        
        // Cargar pedidos guardados
        if (this.config.enableLocalStorage) {
            this.loadFromStorage();
        }
        
        // Iniciar refresco automático
        if (this.config.autoRefresh) {
            this.startAutoRefresh();
        }
        
        console.log('📋 Sistema de pedidos listo - Pedidos:', this.orders.length);
    },
    
    // Añadir nuevo pedido
    addOrder: function(order) {
        order.id = order.id || 'ORD-' + Date.now().toString(36).toUpperCase();
        order.timestamp = order.timestamp || new Date().toISOString();
        order.status = order.status || 'pending';
        
        this.orders.unshift(order);
        this.saveToStorage();
        this.notifyListeners('new-order', order);
        
        // Notificación sonora
        if (this.config.notificationSound) {
            this.playNotificationSound();
        }
        
        console.log('📋 Nuevo pedido:', order.id, '- Mesa:', order.table);
        return order;
    },
    
    // Actualizar estado de un pedido
    updateOrderStatus: function(orderId, newStatus) {
        var order = this.orders.find(function(o) {
            return o.id === orderId;
        });
        
        if (order) {
            order.status = newStatus;
            if (newStatus === 'completed') {
                order.completedAt = new Date().toISOString();
            }
            this.saveToStorage();
            this.notifyListeners('status-update', order);
            console.log('📋 Pedido', orderId, '→', newStatus);
        }
    },
    
    // Obtener pedidos por estado
    getOrdersByStatus: function(status) {
        return this.orders.filter(function(order) {
            return order.status === status;
        });
    },
    
    // Obtener todos los pedidos agrupados
    getOrdersGrouped: function() {
        return {
            pending: this.getOrdersByStatus('pending'),
            preparing: this.getOrdersByStatus('preparing'),
            completed: this.getOrdersByStatus('completed'),
            cancelled: this.getOrdersByStatus('cancelled')
        };
    },
    
    // Obtener estadísticas
    getStats: function() {
        var total = this.orders.length;
        var totalRevenue = this.orders.reduce(function(sum, order) {
            return sum + (order.status !== 'cancelled' ? order.total : 0);
        }, 0);
        
        return {
            total: total,
            pending: this.getOrdersByStatus('pending').length,
            preparing: this.getOrdersByStatus('preparing').length,
            completed: this.getOrdersByStatus('completed').length,
            revenue: totalRevenue
        };
    },
    
    // Buscar pedido
    findOrder: function(orderId) {
        return this.orders.find(function(o) {
            return o.id === orderId;
        });
    },
    
    // Eliminar pedido
    deleteOrder: function(orderId) {
        this.orders = this.orders.filter(function(o) {
            return o.id !== orderId;
        });
        this.saveToStorage();
        this.notifyListeners('order-deleted', orderId);
    },
    
    // Limpiar pedidos completados
    clearCompleted: function() {
        this.orders = this.orders.filter(function(o) {
            return o.status !== 'completed';
        });
        this.saveToStorage();
        this.notifyListeners('orders-cleared');
    },
    
    // Listeners para actualizaciones en tiempo real
    addListener: function(callback) {
        this.listeners.push(callback);
    },
    
    removeListener: function(callback) {
        this.listeners = this.listeners.filter(function(cb) {
            return cb !== callback;
        });
    },
    
    notifyListeners: function(event, data) {
        this.listeners.forEach(function(callback) {
            try {
                callback(event, data);
            } catch(e) {
                console.error('Error en listener:', e);
            }
        });
    },
    
    // Sonido de notificación
    playNotificationSound: function() {
        try {
            var audioContext = new (window.AudioContext || window.webkitAudioContext)();
            var oscillator = audioContext.createOscillator();
            var gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.3;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch(e) {
            // Fallback silencioso
        }
    },
    
    // Auto refresco
    startAutoRefresh: function() {
        var self = this;
        this.refreshTimer = setInterval(function() {
            self.loadFromStorage();
            self.notifyListeners('refresh');
        }, this.config.refreshInterval);
    },
    
    stopAutoRefresh: function() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
    },
    
    // Exportar pedidos
    exportOrders: function() {
        var data = JSON.stringify(this.orders, null, 2);
        var blob = new Blob([data], {type: 'application/json'});
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'pedidos-' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Persistencia
    saveToStorage: function() {
        if (this.config.enableLocalStorage) {
            try {
                localStorage.setItem(this.config.storageKey, JSON.stringify(this.orders));
            } catch(e) {
                console.error('Error guardando pedidos:', e);
            }
        }
    },
    
    loadFromStorage: function() {
        var saved = localStorage.getItem(this.config.storageKey);
        if (saved) {
            try {
                this.orders = JSON.parse(saved);
            } catch(e) {
                this.orders = [];
            }
        }
    }
};