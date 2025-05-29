import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({
    supabaseConnected: false,
    authStatus: 'checking...',
    tablesStatus: {},
    errors: []
  });

  useEffect(() => {
    checkSupabaseStatus();
  }, []);

  const checkSupabaseStatus = async () => {
    const info = {
      supabaseConnected: false,
      authStatus: 'checking...',
      tablesStatus: {},
      errors: []
    };

    try {
      // Test Supabase connection
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        info.errors.push(`Auth error: ${authError.message}`);
      } else {
        info.supabaseConnected = true;
        info.authStatus = user ? `Logged in as ${user.email}` : 'Not logged in';
      }

      // Check tables
      const tables = ['profiles', 'events', 'connections', 'chats', 'memories'];
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('count')
            .limit(1);
          
          if (error) {
            info.tablesStatus[table] = `Error: ${error.message}`;
            if (error.message.includes('does not exist')) {
              info.errors.push(`Table '${table}' needs to be created in Supabase dashboard`);
            }
          } else {
            info.tablesStatus[table] = 'OK';
          }
        } catch (err) {
          info.tablesStatus[table] = `Failed: ${err.message}`;
          info.errors.push(`Table check failed for '${table}': ${err.message}`);
        }
      }

    } catch (error) {
      info.errors.push(`Connection failed: ${error.message}`);
    }

    setDebugInfo(info);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md text-xs font-mono">
      <h3 className="text-sm font-bold mb-2">🔍 Debug Panel</h3>
        <div className="mb-2">
        <strong>Supabase Connection:</strong> 
        <span className={debugInfo.supabaseConnected ? 'text-green-400' : 'text-red-400'}>
          {debugInfo.supabaseConnected ? ' ✅ Connected' : ' ❌ Failed'}
        </span>
      </div>

      <div className="mb-2">
        <strong>Auth Status:</strong> {debugInfo.authStatus}
      </div>

      <div className="mb-2">
        <strong>Tables:</strong>
        {Object.entries(debugInfo.tablesStatus).map(([table, status]) => (
          <div key={table} className="ml-2">
            {table}: <span className={status === 'OK' ? 'text-green-400' : 'text-red-400'}>{status}</span>
          </div>
        ))}
      </div>

      {debugInfo.errors.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-600">
          <strong className="text-red-400">Issues:</strong>
          {debugInfo.errors.map((error, index) => (
            <div key={index} className="text-red-300 text-xs mt-1">{error}</div>
          ))}
        </div>
      )}

      <button 
        onClick={checkSupabaseStatus}
        className="mt-2 px-2 py-1 bg-blue-600 rounded text-xs hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
};

export default DebugPanel;
