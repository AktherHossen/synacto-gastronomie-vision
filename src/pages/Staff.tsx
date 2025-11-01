import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectItem } from '@/components/ui/select';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StaffProfileForm from '@/components/StaffProfileForm';
import { createStaff } from '@/api/createStaff';

interface Staff {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  emergency_contact?: string;
  joining_date?: string;
  is_active: boolean;
}

const roles = ['admin', 'waiter', 'kitchen'];

const StaffPage: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('waiter');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [activeTab, setActiveTab] = useState('list');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('staff').select('*').order('name');
    if (!error && data) {
      setStaff(data);
      // If there's a selected staff member, update their data
      if (selectedStaff) {
        const updated = data.find(s => s.id === selectedStaff.id);
        if (updated) setSelectedStaff(updated);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const isAdmin = staff.find(s => s.id === currentUser?.id)?.role === 'admin';

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !role) return toast({ title: 'All fields required', variant: 'destructive' });

    try {
      const result = await createStaff({ name, email, role });
      toast({
        title: 'Staff Added Successfully',
        description: `Please provide this temporary password to the staff member: ${result.password}`,
      });
      setName(''); 
      setEmail(''); 
      setRole('waiter');
      loadStaff();
    } catch (error: any) {
      toast({
        title: 'Failed to add staff',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('staff').update({ is_active: !current }).eq('id', id);
    loadStaff();
  };

  const handleStaffSelect = (member: Staff) => {
    setSelectedStaff(member);
    setActiveTab('profile');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Management</h1>
        {isAdmin && (
          <Button onClick={() => setActiveTab('add')} variant="outline">
            Add New Staff
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">Staff List</TabsTrigger>
          {selectedStaff && <TabsTrigger value="profile">Profile</TabsTrigger>}
          {isAdmin && <TabsTrigger value="add">Add Staff</TabsTrigger>}
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardHeader className="font-semibold">Current Staff</CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-2 px-4">Name</th>
                    <th className="text-left py-2 px-4">Email</th>
                    <th className="text-left py-2 px-4">Role</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="py-4 text-center">Loading...</td></tr>
                  ) : staff.length === 0 ? (
                    <tr><td colSpan={5} className="py-4 text-center text-gray-500">No staff found.</td></tr>
                  ) : staff.map(s => (
                    <tr key={s.id} className="border-t">
                      <td className="px-4 py-2">{s.name}</td>
                      <td className="px-4 py-2">{s.email}</td>
                      <td className="px-4 py-2">{s.role}</td>
                      <td className="px-4 py-2">{s.is_active ? 'Active' : 'Inactive'}</td>
                      <td className="px-4 py-2 space-x-2">
                        <Button variant="outline" onClick={() => handleStaffSelect(s)}>
                          View Profile
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" onClick={() => toggleActive(s.id, s.is_active)}>
                            {s.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          {selectedStaff && (
            <StaffProfileForm
              staff={selectedStaff}
              onUpdate={loadStaff}
              isAdmin={isAdmin}
            />
          )}
        </TabsContent>

        <TabsContent value="add">
          {isAdmin && (
            <Card>
              <CardHeader className="font-semibold">Add New Staff</CardHeader>
              <CardContent className="flex gap-4 flex-wrap items-center">
                <Input 
                  placeholder="Name" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="flex-1 min-w-[150px]" 
                />
                <Input 
                  placeholder="Email" 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="flex-1 min-w-[200px]" 
                />
                <Select value={role} onValueChange={setRole}>
                  {roles.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </Select>
                <Button onClick={handleAdd}>Add Staff</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffPage;
