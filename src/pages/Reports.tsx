
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Reports = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-600">View sales reports and analytics</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports & Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Reports page is under construction</p>
            <p className="text-gray-400 mt-2">This will contain sales reports and analytics</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
