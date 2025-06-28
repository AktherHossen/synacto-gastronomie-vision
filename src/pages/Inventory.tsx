
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Inventory = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
              <p className="text-gray-600">Track your inventory and stock levels</p>
            </div>
          </div>
          <Button className="text-white" style={{ backgroundColor: '#6B2CF5' }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inventory Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Inventory page is under construction</p>
              <p className="text-gray-400 mt-2">This will contain inventory management functionality</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Inventory;
