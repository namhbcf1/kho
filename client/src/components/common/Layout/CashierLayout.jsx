import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import CashierHeader from '../Header/CashierHeader';
import { useAuth } from '../../../auth/AuthContext';
import { cn } from '../../../lib/utils';

const CashierLayout = () => {
  const [sessionActive, setSessionActive] = useState(false);
  const [cashDrawerOpen, setCashDrawerOpen] = useState(false);
  const { user, session, updateSession } = useAuth();

  useEffect(() => {
    // Check if cashier session is active
    if (session?.status === 'active') {
      setSessionActive(true);
    }
  }, [session]);

  const startSession = async (initialCash) => {
    try {
      const sessionData = {
        startTime: new Date().toISOString(),
        initialCash,
        status: 'active',
        cashierId: user.id
      };
      
      await updateSession(sessionData);
      setSessionActive(true);
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const endSession = async () => {
    try {
      const sessionData = {
        ...session,
        endTime: new Date().toISOString(),
        status: 'closed'
      };
      
      await updateSession(sessionData);
      setSessionActive(false);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <CashierHeader 
          user={user}
          session={session}
          sessionActive={sessionActive}
          onStartSession={startSession}
          onEndSession={endSession}
          cashDrawerOpen={cashDrawerOpen}
          onToggleCashDrawer={() => setCashDrawerOpen(!cashDrawerOpen)}
        />
      </div>

      {/* Main POS Content */}
      <main className="flex-1 pt-16 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Outlet context={{ 
            sessionActive, 
            cashDrawerOpen, 
            startSession, 
            endSession 
          }} />
        </motion.div>
      </main>

      {/* Session Status Indicator */}
      <div className={cn(
        'fixed bottom-4 right-4 px-4 py-2 rounded-full text-sm font-medium',
        sessionActive 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      )}>
        {sessionActive ? 'Ca làm việc đang hoạt động' : 'Ca làm việc đã đóng'}
      </div>

      {/* Cash Drawer Status */}
      {cashDrawerOpen && (
        <div className="fixed bottom-4 left-4 px-4 py-2 bg-amber-500 text-white rounded-full text-sm font-medium">
          Ngăn kéo tiền đang mở
        </div>
      )}
    </div>
  );
};

export default CashierLayout; 