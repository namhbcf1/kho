import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export const useGameification = () => {
  const { user } = useAuth();
  const [gameData, setGameData] = useState({
    points: 0,
    level: 1,
    badges: [],
    achievements: [],
    challenges: [],
    leaderboard: [],
    rewards: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGameData();
    }
  }, [user]);

  const loadGameData = async () => {
    try {
      const response = await fetch(`/api/gamification/user/${user.id}`);
      const data = await response.json();
      setGameData(data);
    } catch (error) {
      console.error('Failed to load game data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPoints = async (points, reason) => {
    try {
      const response = await fetch('/api/gamification/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          points,
          reason
        })
      });
      
      if (response.ok) {
        await loadGameData();
      }
    } catch (error) {
      console.error('Failed to add points:', error);
    }
  };

  const unlockAchievement = async (achievementId) => {
    try {
      const response = await fetch('/api/gamification/achievements/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          achievementId
        })
      });
      
      if (response.ok) {
        await loadGameData();
      }
    } catch (error) {
      console.error('Failed to unlock achievement:', error);
    }
  };

  const completeChallenge = async (challengeId) => {
    try {
      const response = await fetch('/api/gamification/challenges/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          challengeId
        })
      });
      
      if (response.ok) {
        await loadGameData();
      }
    } catch (error) {
      console.error('Failed to complete challenge:', error);
    }
  };

  const redeemReward = async (rewardId) => {
    try {
      const response = await fetch('/api/gamification/rewards/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          rewardId
        })
      });
      
      if (response.ok) {
        await loadGameData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to redeem reward:', error);
      return false;
    }
  };

  const getNextLevel = () => {
    const currentLevel = gameData.level;
    const pointsForNextLevel = currentLevel * 1000; // Example: 1000 points per level
    return {
      level: currentLevel + 1,
      pointsRequired: pointsForNextLevel,
      pointsToGo: pointsForNextLevel - gameData.points
    };
  };

  const getProgressToNextLevel = () => {
    const nextLevel = getNextLevel();
    const currentLevelPoints = (gameData.level - 1) * 1000;
    const pointsInCurrentLevel = gameData.points - currentLevelPoints;
    const pointsNeededForLevel = 1000; // Points needed to advance one level
    
    return (pointsInCurrentLevel / pointsNeededForLevel) * 100;
  };

  return {
    gameData,
    loading,
    addPoints,
    unlockAchievement,
    completeChallenge,
    redeemReward,
    getNextLevel,
    getProgressToNextLevel,
    refresh: loadGameData
  };
};
