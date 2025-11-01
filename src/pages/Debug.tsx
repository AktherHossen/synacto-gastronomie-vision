import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getMenuItems, 
  addMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  type MenuItemFormData 
} from '@/services/menuService';

const Debug = () => {
  const { toast } = useToast();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addTestResult = (test: string, status: 'success' | 'error' | 'info', message: string, details?: any) => {
    setTestResults(prev => [...prev, {
      id: Date.now(),
      test,
      status,
      message,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic Supabase connection
      addTestResult('Supabase Connection', 'info', 'Testing basic connection...');
      const { data: connectionTest, error: connectionError } = await supabase.from('menu_items').select('count');
      
      if (connectionError) {
        addTestResult('Supabase Connection', 'error', `Connection failed: ${connectionError.message}`, connectionError);
      } else {
        addTestResult('Supabase Connection', 'success', 'Connection successful', connectionTest);
      }

      // Test 2: Test menuService.getMenuItems()
      addTestResult('getMenuItems()', 'info', 'Testing getMenuItems function...');
      try {
        const items = await getMenuItems();
        addTestResult('getMenuItems()', 'success', `Retrieved ${items.length} menu items`, items);
        
        // Check if items have the available field
        if (items.length > 0) {
          const firstItem = items[0];
          if ('available' in firstItem) {
            addTestResult('Available Field', 'success', 
              `Available field exists in menu items. Sample: ${firstItem.name} (available: ${firstItem.available})`, 
              firstItem
            );
          } else {
            addTestResult('Available Field', 'error', 'Available field missing from menu items', firstItem);
          }
        }
      } catch (error) {
        addTestResult('getMenuItems()', 'error', `getMenuItems failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
      }

      // Test 3: Test adding a menu item
      addTestResult('addMenuItem()', 'info', 'Testing addMenuItem function...');
      try {
        const testItem: MenuItemFormData = {
          name: 'Test Item - ' + Date.now(),
          description: 'This is a test item for debugging',
          price: 9.99,
          category: 'appetizers',
          available: true
        };
        
        const newItem = await addMenuItem(testItem);
        addTestResult('addMenuItem()', 'success', `Successfully added menu item: ${newItem.name}`, newItem);
        
        // Test 4: Test updating the item
        addTestResult('updateMenuItem()', 'info', 'Testing updateMenuItem function...');
        const updatedItem = await updateMenuItem(newItem.id, {
          ...testItem,
          name: testItem.name + ' (Updated)',
          price: 12.99
        });
        addTestResult('updateMenuItem()', 'success', `Successfully updated menu item: ${updatedItem.name}`, updatedItem);
        
        // Test 5: Test deleting the item
        addTestResult('deleteMenuItem()', 'info', 'Testing deleteMenuItem function...');
        await deleteMenuItem(newItem.id);
        addTestResult('deleteMenuItem()', 'success', `Successfully deleted menu item: ${newItem.name}`);
        
      } catch (error) {
        addTestResult('addMenuItem()', 'error', `addMenuItem failed: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
      }

      // Test 6: Test inserting directly with Supabase
      addTestResult('Direct Supabase Insert', 'info', 'Testing direct Supabase insert...');
      try {
        const directTestItem = {
          name: 'Direct Test - ' + Date.now(),
          description: 'Direct Supabase insert test',
          price: 7.99,
          category: 'beverages',
          available: true
        };
        
        const { data: directInsertData, error: directInsertError } = await supabase
          .from('menu_items')
          .insert([directTestItem])
          .select()
          .single();
          
        if (directInsertError) {
          addTestResult('Direct Supabase Insert', 'error', `Direct insert failed: ${directInsertError.message}`, directInsertError);
        } else {
          addTestResult('Direct Supabase Insert', 'success', `Direct insert successful: ${directInsertData.name}`, directInsertData);
          
          // Clean up the test item
          const { error: cleanupError } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', directInsertData.id);
            
          if (cleanupError) {
            addTestResult('Cleanup', 'error', `Failed to cleanup test item: ${cleanupError.message}`, cleanupError);
          } else {
            addTestResult('Cleanup', 'success', 'Test item cleaned up successfully');
          }
        }
      } catch (error) {
        addTestResult('Direct Supabase Insert', 'error', `Direct insert error: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
      }

    } catch (error) {
      addTestResult('General Error', 'error', `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'info': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Database Debug</h1>
          <p className="text-gray-600">Test Supabase connection and menu_items table</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={clearResults}
            disabled={isRunning}
          >
            Clear Results
          </Button>
          <Button 
            onClick={runAllTests}
            disabled={isRunning}
            className="text-white"
            style={{ backgroundColor: '#6B2CF5' }}
          >
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Test Results */}
      <div className="space-y-4">
        {testResults.map((result) => (
          <Card key={result.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{result.test}</CardTitle>
                <Badge className={getStatusColor(result.status)}>
                  {result.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(result.timestamp).toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{result.message}</p>
              {result.details && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {testResults.length === 0 && !isRunning && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No test results yet. Click "Run All Tests" to start debugging.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Debug; 