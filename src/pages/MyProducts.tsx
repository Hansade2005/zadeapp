import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileBottomNav from '../components/MobileBottomNav';
import ProductForm from '../components/ProductForm';
import { BoostManager } from '../components/BoostManager';
import { Package, Eye, Edit, Trash2, Plus, TrendingUp, Zap, ShoppingCart, Briefcase, Calendar, Users, MessageCircle } from 'lucide-react';

interface Product {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock_quantity: number;
  is_active: boolean;
  featured: boolean;
  tags: string[];
  location?: string;
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  warranty?: string;
  delivery_available: boolean;
  delivery_fee?: number;
  created_at: string;
  updated_at: string;
}

interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  quantity: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  buyer?: { full_name: string; email: string };
  product?: { title: string; images: string[] };
}

interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  applicant?: { full_name: string; email: string; user_type: string };
  job?: { title: string; company_name: string; location: string };
}

interface EventRegistration {
  id: string;
  event_id: string;
  attendee_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  created_at: string;
  attendee?: { full_name: string; email: string };
  event?: { title: string; event_date: string; location: string };
}

interface FreelanceContact {
  id: string;
  freelancer_id: string;
  client_id: string;
  service_type: string;
  status: 'contacted' | 'hired' | 'completed' | 'cancelled';
  created_at: string;
  freelancer?: { full_name: string; email: string; skills: string[] };
}

type TabType = 'products' | 'orders' | 'applications' | 'registrations' | 'contacts';

const MyProducts: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [contacts, setContacts] = useState<FreelanceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [boostingProduct, setBoostingProduct] = useState<string | null>(null);
  const [boostDuration, setBoostDuration] = useState(3);
  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchProducts();
      fetchOrders();
      fetchApplications();
      fetchRegistrations();
      fetchContacts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:users!orders_buyer_id_fkey(full_name, email),
          product:products!orders_product_id_fkey(title, images)
        `)
        .eq('product.seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          applicant:users!job_applications_applicant_id_fkey(full_name, email, user_type),
          job:jobs!job_applications_job_id_fkey(title, company_name, location)
        `)
        .eq('job.employer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchRegistrations = async () => {
    try {
      if (!user?.id) return;

      const { data, error } = await supabase
        .from('event_registrations')
        .select(`
          *,
          attendee:users!event_registrations_attendee_id_fkey(full_name, email),
          event:events!event_registrations_event_id_fkey(title, event_date, location)
        `)
        .eq('event.host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      if (!user?.id) return;

      // This assumes there's a freelance_contacts table or similar
      // For now, we'll use a placeholder - you may need to adjust based on your actual schema
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          freelancer:users!messages_sender_id_fkey(full_name, email),
          client:users!messages_receiver_id_fkey(full_name, email)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .eq('freelancer.user_type', 'freelancer')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      // Transform messages into contacts
      const contactMap = new Map();
      data?.forEach(message => {
        const otherUser = message.sender_id === user.id ? message.client : message.freelancer;
        if (!contactMap.has(otherUser.id)) {
          contactMap.set(otherUser.id, {
            id: otherUser.id,
            freelancer_id: otherUser.id,
            client_id: user.id,
            service_type: 'General Inquiry',
            status: 'contacted',
            created_at: message.created_at,
            freelancer: otherUser
          });
        }
      });
      setContacts(Array.from(contactMap.values()));
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      setProducts(products.filter(product => product.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };

  const toggleProductStatus = async (productId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: newStatus })
        .eq('id', productId);

      if (error) throw error;

      setProducts(products.map(product =>
        product.id === productId
          ? { ...product, is_active: newStatus }
          : product
      ));
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Failed to update product status. Please try again.');
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleProductFormSuccess = () => {
    fetchProducts();
  };

  const handleCloseProductForm = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
                  <p className="text-gray-600 mt-1">Manage your products, orders, and applications</p>
                </div>
                {activeTab === 'products' && (
                  <button
                    onClick={handleCreateProduct}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </button>
                )}
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'products'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Products ({products.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Orders ({orders.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'applications'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Applications ({applications.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('registrations')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'registrations'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Registrations ({registrations.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('contacts')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === 'contacts'
                      ? 'bg-white text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contacts ({contacts.length})</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6">
              {activeTab === 'products' && (
                <>
                  {products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
                      <p className="text-gray-600 mb-6">Start selling by adding your first product</p>
                      <button
                        onClick={handleCreateProduct}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 mx-auto"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Your First Product</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => (
                        <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                          {/* Product Image */}
                          <div className="h-48 bg-gray-200 flex items-center justify-center">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-12 h-12 text-gray-400" />
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.title}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                product.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                            <div className="flex items-center justify-between mb-4">
                              <span className="text-lg font-bold text-indigo-600">
                                ${product.price.toLocaleString()}
                              </span>
                              <span className="text-sm text-gray-500 capitalize">{product.category}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2 text-indigo-600 hover:text-indigo-800 transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setBoostingProduct(product.id)}
                                  className="p-2 text-purple-600 hover:text-purple-800 transition-colors"
                                  title="Boost this product"
                                >
                                  <Zap className="w-4 h-4" />
                                </button>
                              </div>

                              <button
                                onClick={() => toggleProductStatus(product.id, product.is_active)}
                                className={`px-3 py-1 text-xs rounded ${
                                  product.is_active
                                    ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200'
                                } transition-colors`}
                              >
                                {product.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders yet</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id.slice(-8)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.buyer?.full_name || order.buyer?.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.product?.title}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${order.total_amount.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                  order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'applications' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Job Applications</h2>
                  {applications.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No job applications yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {applications.map((application) => (
                        <div key={application.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{application.job?.title}</h3>
                              <p className="text-gray-600">{application.job?.company_name}</p>
                              <p className="text-sm text-gray-500">{application.job?.location}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status}
                            </span>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">
                              <strong>Applicant:</strong> {application.applicant?.full_name} ({application.applicant?.user_type})
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Email:</strong> {application.applicant?.email}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Applied on {new Date(application.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'registrations' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Event Registrations</h2>
                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No event registrations yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {registrations.map((registration) => (
                        <div key={registration.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{registration.event?.title}</h3>
                              <p className="text-gray-600">{registration.event?.location}</p>
                              <p className="text-sm text-gray-500">
                                {new Date(registration.event?.event_date || '').toLocaleDateString()}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              registration.status === 'attended' ? 'bg-green-100 text-green-800' :
                              registration.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {registration.status}
                            </span>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">
                              <strong>Attendee:</strong> {registration.attendee?.full_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>Email:</strong> {registration.attendee?.email}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Registered on {new Date(registration.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'contacts' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">Freelance Contacts</h2>
                  {contacts.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No freelance contacts yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {contacts.map((contact) => (
                        <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{contact.freelancer?.full_name}</h3>
                              <p className="text-gray-600">{contact.freelancer?.email}</p>
                              <p className="text-sm text-gray-500">{contact.service_type}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              contact.status === 'completed' ? 'bg-green-100 text-green-800' :
                              contact.status === 'hired' ? 'bg-blue-100 text-blue-800' :
                              contact.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {contact.status}
                            </span>
                          </div>
                          <div className="border-t pt-4">
                            <p className="text-sm text-gray-600">
                              <strong>Skills:</strong> {contact.freelancer?.skills?.join(', ') || 'Not specified'}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                              Contacted on {new Date(contact.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />

      <ProductForm
        isOpen={showProductForm}
        onClose={handleCloseProductForm}
        onSuccess={handleProductFormSuccess}
        initialData={editingProduct ? {
          title: editingProduct.title,
          description: editingProduct.description,
          price: editingProduct.price,
          original_price: editingProduct.original_price,
          category: editingProduct.category,
          subcategory: editingProduct.subcategory,
          stock_quantity: editingProduct.stock_quantity,
          location: editingProduct.location,
          condition: editingProduct.condition,
          brand: editingProduct.brand,
          warranty: editingProduct.warranty,
          delivery_available: editingProduct.delivery_available,
          delivery_fee: editingProduct.delivery_fee,
          tags: editingProduct.tags?.join(', '),
        } : undefined}
        initialImages={editingProduct?.images || []}
        isEditing={!!editingProduct}
        productId={editingProduct?.id}
      />

      {boostingProduct && (
        <BoostManager
          entityType="product"
          entityId={boostingProduct}
          entityTitle={products.find(p => p.id === boostingProduct)?.title || 'Product'}
          onClose={() => setBoostingProduct(null)}
          onBoostSuccess={() => {
            setBoostingProduct(null);
            toast.success('Product boosted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default MyProducts;