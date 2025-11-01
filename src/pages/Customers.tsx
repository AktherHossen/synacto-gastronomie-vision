import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Type for a customer row
// Replace 'public' with your schema if different
// TODO: Replace with actual vendor_id from context or auth
const VENDOR_ID = 'TODO_VENDOR_ID';

type Customer = Database['public']['Tables']['customers']['Row'];
type InsertCustomer = Database['public']['Tables']['customers']['Insert'];
type UpdateCustomer = Database['public']['Tables']['customers']['Update'];

type ModalMode = 'add' | 'view' | 'edit';

const Customers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<ModalMode>('add');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [formError, setFormError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers, isLoading, isError, error } = useQuery({
    queryKey: ['customers', VENDOR_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('vendor_id', VENDOR_ID)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Customer[];
    }
  });

  // Add customer mutation
  const addCustomerMutation = useMutation({
    mutationFn: async (newCustomer: InsertCustomer) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers', VENDOR_ID] }),
  });

  // Edit customer mutation
  const editCustomerMutation = useMutation({
    mutationFn: async (update: { id: string; data: UpdateCustomer }) => {
      const { data, error } = await supabase
        .from('customers')
        .update(update.data)
        .eq('id', update.id)
        .select()
        .single();
      if (error) throw error;
      return data as Customer;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers', VENDOR_ID] }),
  });

  // Delete customer mutation
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers', VENDOR_ID] }),
  });

  // Filtered customers
  const filteredCustomers = (customers || []).filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  );

  // Modal logic
  const openAddModal = () => {
    setForm({ name: '', email: '', phone: '' });
    setFormError('');
    setSelectedCustomer(null);
    setModalMode('add');
    setIsModalOpen(true);
  };
  const openViewModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setModalMode('view');
    setIsModalOpen(true);
  };
  const openEditModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setForm({ name: customer.name || '', email: customer.email || '', phone: customer.phone || '' });
    setFormError('');
    setModalMode('edit');
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  // Delete dialog logic
  const openDeleteDialog = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };
  const closeDeleteDialog = () => {
    setCustomerToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Form handlers
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setFormError('Invalid email address.');
      return;
    }
    if (!/^\+?\d{8,}$/.test(form.phone)) {
      setFormError('Invalid phone number.');
      return;
    }
    try {
      await addCustomerMutation.mutateAsync({
        name: form.name,
        email: form.email,
        phone: form.phone,
        vendor_id: VENDOR_ID,
        loyalty_points: 0,
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to add customer.');
    }
  };

  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setFormError('All fields are required.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setFormError('Invalid email address.');
      return;
    }
    if (!/^\+?\d{8,}$/.test(form.phone)) {
      setFormError('Invalid phone number.');
      return;
    }
    if (!selectedCustomer) return;
    try {
      await editCustomerMutation.mutateAsync({
        id: selectedCustomer.id,
        data: {
          name: form.name,
          email: form.email,
          phone: form.phone,
        },
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update customer.');
    }
  };

  const handleDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await deleteCustomerMutation.mutateAsync(customerToDelete.id);
      closeDeleteDialog();
    } catch (err) {
      // Optionally show error
      closeDeleteDialog();
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
          onClick={openAddModal}
        >
          Add Customer
        </button>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xs px-3 py-2 border rounded shadow-sm focus:outline-none focus:ring"
        />
      </div>
      <div className="bg-white rounded shadow p-4 min-h-[200px]">
        {isLoading ? (
          <p className="text-gray-500">Loading customers...</p>
        ) : isError ? (
          <p className="text-red-600">Error: {error?.message || 'Failed to load customers.'}</p>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-gray-500">No customers found.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Name</th>
                <th className="text-left py-2 px-2">Email</th>
                <th className="text-left py-2 px-2">Phone</th>
                <th className="text-left py-2 px-2">Points</th>
                <th className="text-left py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-2 font-medium">{c.name}</td>
                  <td className="py-2 px-2">{c.email}</td>
                  <td className="py-2 px-2">{c.phone}</td>
                  <td className="py-2 px-2">{c.loyalty_points ?? 0}</td>
                  <td className="py-2 px-2">
                    <button className="text-primary hover:underline mr-2" onClick={() => openViewModal(c)}>View</button>
                    <button className="text-blue-600 hover:underline mr-2" onClick={() => openEditModal(c)}>Edit</button>
                    <button className="text-red-600 hover:underline" onClick={() => openDeleteDialog(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add, View, Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              onClick={closeModal}
              aria-label="Close"
            >
              ×
            </button>
            {modalMode === 'add' && (
              <>
                <h2 className="text-xl font-bold mb-4">Add Customer</h2>
                <form onSubmit={handleAddCustomer} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  {formError && <div className="text-red-600 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                      disabled={addCustomerMutation.isPending}
                    >
                      {addCustomerMutation.isPending ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </form>
              </>
            )}
            {modalMode === 'view' && selectedCustomer && (
              <>
                <h2 className="text-xl font-bold mb-4">Customer Details</h2>
                <div className="space-y-2">
                  <div><span className="font-medium">Name:</span> {selectedCustomer.name}</div>
                  <div><span className="font-medium">Email:</span> {selectedCustomer.email}</div>
                  <div><span className="font-medium">Phone:</span> {selectedCustomer.phone}</div>
                  <div><span className="font-medium">Points:</span> {selectedCustomer.loyalty_points ?? 0}</div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => openEditModal(selectedCustomer)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
            {modalMode === 'edit' && selectedCustomer && (
              <>
                <h2 className="text-xl font-bold mb-4">Edit Customer</h2>
                <form onSubmit={handleEditCustomer} className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                      required
                    />
                  </div>
                  {formError && <div className="text-red-600 text-sm">{formError}</div>}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark"
                      disabled={editCustomerMutation.isPending}
                    >
                      {editCustomerMutation.isPending ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm relative">
            <h2 className="text-lg font-bold mb-4">Delete Customer</h2>
            <p className="mb-6">Are you sure you want to delete <span className="font-semibold">{customerToDelete.name}</span>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={closeDeleteDialog}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                onClick={handleDeleteCustomer}
                disabled={deleteCustomerMutation.isPending}
              >
                {deleteCustomerMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers; 