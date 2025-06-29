
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GermanComplianceDashboard from '@/components/GermanComplianceDashboard';

const Settings = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your restaurant settings</p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="compliance">Deutsche Compliance</TabsTrigger>
          <TabsTrigger value="printer">Drucker</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">General settings are under construction</p>
                <p className="text-gray-400 mt-2">This will contain restaurant configuration options</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance" className="space-y-4">
          <GermanComplianceDashboard />
        </TabsContent>
        
        <TabsContent value="printer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drucker Einstellungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Printer settings are under construction</p>
                <p className="text-gray-400 mt-2">Configure receipt printers and kitchen printers</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
