import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Database, TestTube } from 'lucide-react';

const DatabaseTest = () => {
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    const results: string[] = [];
    
    try {
      // Test 1: Basic connection
      results.push('🔍 Testing Supabase connection...');
      const { data: connectionTest, error: connectionError } = await supabase
        .from('ingredients')
        .select('count')
        .limit(1);
      
      if (connectionError) {
        results.push(`❌ Connection failed: ${connectionError.message}`);
        throw connectionError;
      }
      
      results.push('✅ Supabase connection successful');
      
      // Test 2: Table existence
      results.push('🔍 Testing ingredients table...');
      const { data: tableTest, error: tableError } = await supabase
        .from('ingredients')
        .select('*')
        .limit(1);
      
      if (tableError) {
        results.push(`❌ Table test failed: ${tableError.message}`);
        throw tableError;
      }
      
      results.push('✅ Ingredients table exists and is accessible');
      
      // Test 3: Insert test
      results.push('🔍 Testing insert operation...');
      const testIngredient = {
        name: 'Test Ingredient',
        unit: 'kg',
        stock_quantity: 1,
        expiry_date: '2024-12-31',
        cost_per_unit: 1.00,
        created_at: new Date().toISOString()
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('ingredients')
        .insert([testIngredient])
        .select();
      
      if (insertError) {
        results.push(`❌ Insert test failed: ${insertError.message}`);
        throw insertError;
      }
      
      results.push('✅ Insert operation successful');
      
      // Test 4: Clean up test data
      if (insertData && insertData.length > 0) {
        results.push('🔍 Cleaning up test data...');
        const { error: deleteError } = await supabase
          .from('ingredients')
          .delete()
          .eq('name', 'Test Ingredient');
        
        if (deleteError) {
          results.push(`⚠️ Cleanup failed: ${deleteError.message}`);
        } else {
          results.push('✅ Test data cleaned up');
        }
      }
      
      results.push('🎉 All tests passed! Database is working correctly.');
      
      toast({
        title: "Database Test Complete",
        description: "All database operations are working correctly.",
      });
      
    } catch (error: any) {
      results.push(`❌ Test failed: ${error.message}`);
      
      toast({
        title: "Database Test Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
      setTestResults(results);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Database Connection Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          This will test the Supabase connection and verify that the ingredients table exists and is accessible.
        </p>
        
        <Button
          onClick={runTests}
          disabled={isTesting}
          className="w-full text-white"
          style={{ backgroundColor: '#6B2CF5' }}
        >
          {isTesting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Running Tests...
            </div>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Run Database Tests
            </>
          )}
        </Button>
        
        {testResults.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Test Results:</h4>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-sm font-mono">
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DatabaseTest; 