
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your restaurant settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Restaurant Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Settings page is under construction</p>
            <p className="text-gray-400 mt-2">This will contain restaurant configuration options</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
