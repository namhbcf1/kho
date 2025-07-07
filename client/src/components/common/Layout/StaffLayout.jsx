import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import StaffHeader from '../Header/StaffHeader';
import StaffSidebar from '../Sidebar/StaffSidebar';
import { useAuth } from '../../../auth/AuthContext';
import { useGameification } from '../../../utils/hooks/useGameification';
import { cn } from '../../../lib/utils';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user } = useAuth();
  const { 
    userStats, 
    currentLevel, 
    nextLevel, 
    progressToNext, 
    achievements,
    dailyGoals,
    weeklyGoals
  } = useGameification();

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out w-64',
          !sidebarOpen && 'hidden lg:flex'
        )}
      >
        <StaffSidebar 
          userStats={userStats}
          currentLevel={currentLevel}
          achievements={achievements}
          dailyGoals={dailyGoals}
          weeklyGoals={weeklyGoals}
        />
      </motion.div>

      {/* Main Content */}
      <div className={cn(
        'flex flex-1 flex-col transition-all duration-300 ease-in-out lg:ml-64'
      )}>
        {/* Header */}
        <StaffHeader 
          user={user}
          userStats={userStats}
          currentLevel={currentLevel}
          nextLevel={nextLevel}
          progressToNext={progressToNext}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet context={{ 
                userStats, 
                currentLevel, 
                nextLevel, 
                progressToNext,
                achievements,
                dailyGoals,
                weeklyGoals
              }} />
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Achievement Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {achievements
          .filter(achievement => achievement.isNew)
          .map((achievement) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-3 rounded-lg shadow-lg"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{achievement.icon}</span>
                <div>
                  <p className="font-bold">Thành tích mới!</p>
                  <p className="text-sm">{achievement.name}</p>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default StaffLayout; 