import React from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  vendor: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem
}) => {
  const navigate = useNavigate();
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50000 ? 0 : 2500; // Free shipping over $50,000
  const total = subtotal + shipping;

  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Drawer */}
          <div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Shopping Cart ({items.length})</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <p className="text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-sm text-center">Add some products to get started!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.vendor}</p>
                        <p className="text-sm font-medium text-indigo-600">
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `$${shipping.toLocaleString()}`}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base border-t pt-2">
                    <span>Total</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                >
                  Proceed to Checkout
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={onClose}
                  className="w-full text-indigo-600 py-2 text-sm font-medium hover:text-indigo-700 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default CartDrawer;