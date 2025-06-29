
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Staff = () => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
          <p className="text-gray-600">Manage your restaurant staff</p>
        </div>
        <Button className="text-white" style={{ backgroundColor: '#6B2CF5' }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Staff Member
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Staff page is under construction</p>
            <p className="text-gray-400 mt-2">This will contain staff management functionality</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Staff;
