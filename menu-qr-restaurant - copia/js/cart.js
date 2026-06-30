// ============================================
// SISTEMA DE CARRITO MODULAR
// Con soporte para comentarios por plato
// ============================================

var CartSystem = {
    items: [],
    tableNumber: null,
    
    config: {
        currency: '€',
        currencyPosition: 'after',
        storageKey: 'menu-cart-items',
        tableKey: 'menu-table-number',
        enableLocalStorage: true,
        maxCommentLength: 100
    },
    
    // Inicializar
    init: function(userConfig) {
        if (userConfig) Object.assign(this.config, userConfig);
        
        // Preguntar número de mesa
        this.askTableNumber();
        
        // Cargar items guardados
        if (this.config.enableLocalStorage) {
            this.loadFromStorage();
        }
        
        // Crear UI
        this.createCartUI();
        this.updateBadge();
        
        console.log('🛒 Carrito listo - Items:', this.items.length);
    },
    
    // Preguntar número de mesa
    askTableNumber: function() {
        var saved = localStorage.getItem(this.config.tableKey);
        if (saved) {
            this.tableNumber = saved;
        }
    },
    
    // Añadir item
    addItem: function(item, comment) {
        var existing = this.items.find(function(i) {
            return i.id === item.id;
        });
        
        if (existing) {
            existing.quantity++;
            if (comment) existing.comment = comment;
        } else {
            this.items.push({
                id: item.id,
                name: item.name,
                price: item.price,
                icon: item.icon,
                quantity: 1,
                comment: comment || ''
            });
        }
        
        this.saveToStorage();
        this.updateBadge();
        this.showFeedback(item.name + ' añadido ✓');
    },
    
    // Quitar una unidad
    removeItem: function(itemId) {
        var index = this.items.findIndex(function(i) {
            return i.id === itemId;
        });
        
        if (index !== -1) {
            if (this.items[index].quantity > 1) {
                this.items[index].quantity--;
            } else {
                this.items.splice(index, 1);
            }
        }
        
        this.saveToStorage();
        this.updateBadge();
        this.renderCartItems();
    },
    
    // Eliminar completamente
    deleteItem: function(itemId) {
        this.items = this.items.filter(function(i) {
            return i.id !== itemId;
        });
        
        this.saveToStorage();
        this.updateBadge();
        this.renderCartItems();
    },
    
    // Actualizar comentario
    updateComment: function(itemId, comment) {
        var item = this.items.find(function(i) {
            return i.id === itemId;
        });
        
        if (item && comment.length <= this.config.maxCommentLength) {
            item.comment = comment;
            this.saveToStorage();
        }
    },
    
    // Vaciar carrito
    clearCart: function() {
        if (confirm('¿Vaciar todo el carrito?')) {
            this.items = [];
            this.saveToStorage();
            this.updateBadge();
            this.renderCartItems();
            this.closeCart();
        }
    },
    
    // Obtener total
    getTotal: function() {
        var self = this;
        return this.items.reduce(function(total, item) {
            return total + (item.price * item.quantity);
        }, 0);
    },
    
    // Formatear precio
    formatPrice: function(price) {
        if (this.config.currencyPosition === 'before') {
            return this.config.currency + price.toFixed(2);
        }
        return price.toFixed(2) + this.config.currency;
    },
    
    // Enviar pedido
    sendOrder: function() {
        var self = this;
        
        if (this.items.length === 0) {
            alert('🛒 El carrito está vacío');
            return;
        }
        
        if (!this.tableNumber) {
            var table = prompt('🪑 Número de mesa:', '1');
            if (!table) return;
            this.tableNumber = table;
            localStorage.setItem(this.config.tableKey, table);
        }
        
        var order = {
            id: 'ORD-' + Date.now().toString(36).toUpperCase(),
            table: this.tableNumber,
            items: this.items.map(function(item) {
                return {
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    comment: item.comment || '',
                    subtotal: item.price * item.quantity
                };
            }),
            total: this.getTotal(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // Enviar al sistema de pedidos
        if (typeof OrdersSystem !== 'undefined') {
            OrdersSystem.addOrder(order);
            
            this.items = [];
            this.saveToStorage();
            this.updateBadge();
            this.renderCartItems();
            this.closeCart();
            
            alert('✅ ¡Pedido enviado!\n\nMesa: ' + this.tableNumber +
                  '\nTotal: ' + this.formatPrice(order.total) +
                  '\n\nTu pedido llegará pronto 🍽️');
        } else {
            // Fallback sin panel
            var summary = order.items.map(function(item) {
                var line = item.quantity + 'x ' + item.name;
                if (item.comment) line += '\n   💬 ' + item.comment;
                return line + ' - ' + self.formatPrice(item.subtotal);
            }).join('\n\n');
            
            alert('📋 PEDIDO ENVIADO\n\nMesa: ' + this.tableNumber +
                  '\n\n' + summary +
                  '\n\nTotal: ' + self.formatPrice(order.total) +
                  '\n\n✅ El restaurante ha recibido tu pedido');
            
            this.items = [];
            this.saveToStorage();
            this.updateBadge();
            this.renderCartItems();
            this.closeCart();
        }
    },
    
    // Mostrar feedback
    showFeedback: function(message) {
        var existing = document.querySelector('.cart-feedback');
        if (existing) existing.remove();
        
        var feedback = document.createElement('div');
        feedback.className = 'cart-feedback';
        feedback.textContent = message;
        document.body.appendChild(feedback);
        
        setTimeout(function() {
            feedback.classList.add('show');
        }, 10);
        
        setTimeout(function() {
            feedback.classList.remove('show');
            setTimeout(function() {
                feedback.remove();
            }, 300);
        }, 1500);
    },
    
    // Crear UI
    createCartUI: function() {
        var self = this;
        
        // Botón flotante
        var cartBtn = document.createElement('button');
        cartBtn.className = 'cart-floating-btn';
        cartBtn.id = 'cartFloatingBtn';
        cartBtn.onclick = function() { self.toggleCart(); };
        cartBtn.innerHTML = '<span>🛒</span><span>Pedido</span><span class="cart-count" id="cartCount">0</span>';
        document.body.appendChild(cartBtn);
        
        // Modal del carrito
        var cartModal = document.createElement('div');
        cartModal.className = 'cart-modal-overlay';
        cartModal.id = 'cartModal';
        cartModal.onclick = function(e) {
            if (e.target === cartModal) self.closeCart();
        };
        cartModal.innerHTML = 
            '<div class="cart-modal-sheet" onclick="event.stopPropagation()">' +
                '<div class="cart-modal-handle"></div>' +
                '<div class="cart-modal-header">' +
                    '<h3>🛒 Tu Pedido</h3>' +
                    '<button class="cart-close-btn" id="cartCloseBtn">✕</button>' +
                '</div>' +
                '<div class="cart-items-list" id="cartItemsList"></div>' +
                '<div class="cart-footer">' +
                    '<div class="cart-total-row">' +
                        '<span>Total:</span>' +
                        '<span class="cart-total-price" id="cartTotalPrice">0.00</span>' +
                    '</div>' +
                    '<div class="cart-table-info" id="cartTableInfo">Mesa: --</div>' +
                    '<div class="cart-actions">' +
                        '<button class="cart-btn cart-btn-clear" id="cartClearBtn">🗑️ Vaciar</button>' +
                        '<button class="cart-btn cart-btn-send" id="cartSendBtn">📤 Enviar pedido</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        document.body.appendChild(cartModal);
        
        // Event listeners
        document.getElementById('cartCloseBtn').onclick = function() { self.closeCart(); };
        document.getElementById('cartClearBtn').onclick = function() { self.clearCart(); };
        document.getElementById('cartSendBtn').onclick = function() { self.sendOrder(); };
        
        // Cerrar con gesto
        var startY = 0;
        var sheet = cartModal.querySelector('.cart-modal-sheet');
        sheet.addEventListener('touchstart', function(e) {
            startY = e.touches[0].clientY;
        });
        sheet.addEventListener('touchmove', function(e) {
            if (e.touches[0].clientY - startY > 100) {
                self.closeCart();
            }
        });
    },
    
    // Abrir/cerrar carrito
    toggleCart: function() {
        var modal = document.getElementById('cartModal');
        if (modal.classList.contains('active')) {
            this.closeCart();
        } else {
            this.openCart();
        }
    },
    
    openCart: function() {
        document.getElementById('cartModal').classList.add('active');
        this.renderCartItems();
    },
    
    closeCart: function() {
        document.getElementById('cartModal').classList.remove('active');
    },
    
    // Renderizar items del carrito
    renderCartItems: function() {
        var self = this;
        var container = document.getElementById('cartItemsList');
        var totalEl = document.getElementById('cartTotalPrice');
        var tableEl = document.getElementById('cartTableInfo');
        
        if (!container) return;
        
        tableEl.textContent = 'Mesa: ' + (this.tableNumber || '--');
        totalEl.textContent = this.formatPrice(this.getTotal());
        
        if (this.items.length === 0) {
            container.innerHTML = 
                '<div class="cart-empty">' +
                    '<div class="cart-empty-icon">🛒</div>' +
                    '<p>Tu carrito está vacío</p>' +
                    '<p style="font-size:0.85em;color:var(--current-text-light);">Toca los platos del menú para añadirlos</p>' +
                '</div>';
            return;
        }
        
        container.innerHTML = this.items.map(function(item) {
            return '<div class="cart-item">' +
                '<div class="cart-item-icon">' + item.icon + '</div>' +
                '<div class="cart-item-info">' +
                    '<div class="cart-item-name">' + item.name + '</div>' +
                    '<div class="cart-item-price">' + self.formatPrice(item.price) + ' c/u</div>' +
                    '<div class="cart-item-controls">' +
                        '<button class="cart-qty-btn" onclick="CartSystem.removeItem(' + item.id + ')">−</button>' +
                        '<span class="cart-qty-number">' + item.quantity + '</span>' +
                        '<button class="cart-qty-btn" onclick="CartSystem.addItem({id:' + item.id + ',name:\'' + item.name + '\',price:' + item.price + ',icon:\'' + item.icon + '\'})">+</button>' +
                        '<button class="cart-delete-btn" onclick="CartSystem.deleteItem(' + item.id + ')" title="Eliminar">🗑️</button>' +
                    '</div>' +
                    '<textarea class="cart-item-comment" ' +
                        'placeholder="✏️ Añadir preferencia... (ej: sin cebolla, poco hecho)" ' +
                        'maxlength="' + self.config.maxCommentLength + '" ' +
                        'onchange="CartSystem.updateComment(' + item.id + ', this.value)" ' +
                        'onkeyup="CartSystem.updateComment(' + item.id + ', this.value)">' + 
                        (item.comment || '') + 
                    '</textarea>' +
                '</div>' +
            '</div>';
        }).join('');
    },
    
    // Actualizar badge
    updateBadge: function() {
        var badge = document.getElementById('cartCount');
        if (badge) {
            var total = this.items.reduce(function(sum, item) {
                return sum + item.quantity;
            }, 0);
            badge.textContent = total;
            
            // Animación
            var btn = document.getElementById('cartFloatingBtn');
            if (btn) {
                btn.classList.add('cart-bounce');
                setTimeout(function() {
                    btn.classList.remove('cart-bounce');
                }, 300);
            }
        }
    },
    
    // Persistencia
    saveToStorage: function() {
        if (this.config.enableLocalStorage) {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.items));
        }
    },
    
    loadFromStorage: function() {
        var saved = localStorage.getItem(this.config.storageKey);
        if (saved) {
            try {
                this.items = JSON.parse(saved);
            } catch(e) {
                this.items = [];
            }
        }
    }
};