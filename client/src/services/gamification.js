import { api } from './api';

// Gamification Service
export class GamificationService {
  constructor() {
    this.pointsConfig = {
      SALE_COMPLETED: 10,
      DAILY_TARGET_MET: 50,
      WEEKLY_TARGET_MET: 200,
      MONTHLY_TARGET_MET: 1000,
      CUSTOMER_SATISFACTION: 25,
      PRODUCT_KNOWLEDGE_QUIZ: 15,
      TRAINING_COMPLETED: 30,
      REFERRAL_BONUS: 100,
      PERFECT_ATTENDANCE: 150,
      UPSELL_SUCCESS: 20,
      CROSS_SELL_SUCCESS: 15,
      RETURN_HANDLED: 5,
      INVENTORY_ACCURACY: 10
    };

    this.badgeTypes = {
      BRONZE: { name: 'Đồng', color: '#cd7f32', minPoints: 0 },
      SILVER: { name: 'Bạc', color: '#c0c0c0', minPoints: 500 },
      GOLD: { name: 'Vàng', color: '#ffd700', minPoints: 1500 },
      PLATINUM: { name: 'Bạch Kim', color: '#e5e4e2', minPoints: 3000 },
      DIAMOND: { name: 'Kim Cương', color: '#b9f2ff', minPoints: 5000 }
    };

    this.achievements = {
      FIRST_SALE: {
        id: 'first_sale',
        name: 'Bán hàng đầu tiên',
        description: 'Hoàn thành giao dịch đầu tiên',
        icon: '🎯',
        points: 50,
        rarity: 'common'
      },
      SALES_STREAK_7: {
        id: 'sales_streak_7',
        name: 'Chiến thắng 7 ngày',
        description: 'Đạt mục tiêu bán hàng 7 ngày liên tiếp',
        icon: '🔥',
        points: 200,
        rarity: 'rare'
      },
      CUSTOMER_CHAMPION: {
        id: 'customer_champion',
        name: 'Nhà vô địch khách hàng',
        description: 'Đạt 100% hài lòng khách hàng trong tháng',
        icon: '👑',
        points: 500,
        rarity: 'epic'
      },
      SALES_LEGEND: {
        id: 'sales_legend',
        name: 'Huyền thoại bán hàng',
        description: 'Đạt top 1 bán hàng 3 tháng liên tiếp',
        icon: '🏆',
        points: 1000,
        rarity: 'legendary'
      },
      KNOWLEDGE_MASTER: {
        id: 'knowledge_master',
        name: 'Bậc thầy kiến thức',
        description: 'Hoàn thành tất cả khóa đào tạo sản phẩm',
        icon: '🧠',
        points: 300,
        rarity: 'rare'
      },
      TEAM_PLAYER: {
        id: 'team_player',
        name: 'Đồng đội xuất sắc',
        description: 'Hỗ trợ đồng nghiệp đạt mục tiêu',
        icon: '🤝',
        points: 150,
        rarity: 'common'
      },
      INNOVATION_AWARD: {
        id: 'innovation_award',
        name: 'Giải thưởng sáng tạo',
        description: 'Đề xuất cải tiến được áp dụng',
        icon: '💡',
        points: 400,
        rarity: 'epic'
      }
    };

    this.challengeTypes = {
      DAILY: 'daily',
      WEEKLY: 'weekly',
      MONTHLY: 'monthly',
      SPECIAL: 'special'
    };

    this.rewardTypes = {
      POINTS: 'points',
      BADGE: 'badge',
      VOUCHER: 'voucher',
      CASH: 'cash',
      GIFT: 'gift',
      EXPERIENCE: 'experience'
    };
  }

  // ======================
  // POINTS SYSTEM
  // ======================

  async awardPoints(userId, action, metadata = {}) {
    const points = this.pointsConfig[action] || 0;
    
    if (points === 0) {
      console.warn(`No points configured for action: ${action}`);
      return { success: false, error: 'Invalid action' };
    }

    try {
      const pointsRecord = {
        userId,
        action,
        points,
        metadata,
        timestamp: new Date().toISOString()
      };

      // Award points
      await api.post('/gamification/points', pointsRecord);

      // Check for level up
      const levelUp = await this.checkLevelUp(userId);

      // Check for new achievements
      const newAchievements = await this.checkAchievements(userId, action, metadata);

      return {
        success: true,
        points,
        levelUp,
        newAchievements,
        message: `Bạn đã nhận được ${points} điểm cho ${this.getActionDisplayName(action)}!`
      };
    } catch (error) {
      console.error('Points award error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserPoints(userId) {
    try {
      const response = await api.get(`/gamification/users/${userId}/points`);
      return {
        success: true,
        totalPoints: response.data.totalPoints || 0,
        currentLevel: this.calculateLevel(response.data.totalPoints || 0),
        pointsHistory: response.data.history || []
      };
    } catch (error) {
      console.error('Get user points error:', error);
      return { success: false, error: error.message };
    }
  }

  calculateLevel(totalPoints) {
    const levels = [
      { level: 1, minPoints: 0, name: 'Người mới', color: '#94a3b8' },
      { level: 2, minPoints: 100, name: 'Học việc', color: '#06b6d4' },
      { level: 3, minPoints: 300, name: 'Nhân viên', color: '#10b981' },
      { level: 4, minPoints: 600, name: 'Nhân viên giỏi', color: '#f59e0b' },
      { level: 5, minPoints: 1000, name: 'Chuyên gia', color: '#ef4444' },
      { level: 6, minPoints: 1500, name: 'Chuyên gia cao cấp', color: '#8b5cf6' },
      { level: 7, minPoints: 2500, name: 'Trưởng nhóm', color: '#ec4899' },
      { level: 8, minPoints: 4000, name: 'Quản lý', color: '#f97316' },
      { level: 9, minPoints: 6000, name: 'Quản lý cao cấp', color: '#3b82f6' },
      { level: 10, minPoints: 10000, name: 'Giám đốc', color: '#ffd700' }
    ];

    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalPoints >= levels[i].minPoints) {
        const nextLevel = levels[i + 1];
        return {
          ...levels[i],
          progress: nextLevel ? 
            ((totalPoints - levels[i].minPoints) / (nextLevel.minPoints - levels[i].minPoints)) * 100 : 100,
          nextLevelPoints: nextLevel ? nextLevel.minPoints : null
        };
      }
    }

    return levels[0];
  }

  async checkLevelUp(userId) {
    const userPoints = await this.getUserPoints(userId);
    if (!userPoints.success) return null;

    const currentLevel = userPoints.currentLevel;
    const previousLevel = await this.getUserPreviousLevel(userId);

    if (currentLevel.level > previousLevel) {
      // Award level up bonus
      await this.awardLevelUpBonus(userId, currentLevel.level);
      
      // Update user level
      await api.put(`/gamification/users/${userId}/level`, {
        level: currentLevel.level,
        levelName: currentLevel.name
      });

      return {
        newLevel: currentLevel.level,
        levelName: currentLevel.name,
        bonusPoints: currentLevel.level * 50
      };
    }

    return null;
  }

  // ======================
  // BADGES & ACHIEVEMENTS
  // ======================

  async checkAchievements(userId, action, metadata) {
    const newAchievements = [];

    // Check each achievement condition
    for (const [key, achievement] of Object.entries(this.achievements)) {
      const hasAchievement = await this.userHasAchievement(userId, achievement.id);
      
      if (!hasAchievement && await this.checkAchievementCondition(userId, achievement, action, metadata)) {
        await this.awardAchievement(userId, achievement);
        newAchievements.push(achievement);
      }
    }

    return newAchievements;
  }

  async checkAchievementCondition(userId, achievement, action, metadata) {
    switch (achievement.id) {
      case 'first_sale':
        return action === 'SALE_COMPLETED';
      
      case 'sales_streak_7':
        return await this.checkSalesStreak(userId, 7);
      
      case 'customer_champion':
        return await this.checkCustomerSatisfaction(userId, 100);
      
      case 'sales_legend':
        return await this.checkTopSeller(userId, 3);
      
      case 'knowledge_master':
        return await this.checkTrainingCompletion(userId);
      
      default:
        return false;
    }
  }

  async awardAchievement(userId, achievement) {
    try {
      await api.post('/gamification/achievements', {
        userId,
        achievementId: achievement.id,
        timestamp: new Date().toISOString()
      });

      // Award achievement points
      await this.awardPoints(userId, 'ACHIEVEMENT_UNLOCKED', {
        achievementId: achievement.id,
        points: achievement.points
      });

      return { success: true };
    } catch (error) {
      console.error('Award achievement error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserAchievements(userId) {
    try {
      const response = await api.get(`/gamification/users/${userId}/achievements`);
      return {
        success: true,
        achievements: response.data.achievements || [],
        totalAchievements: Object.keys(this.achievements).length,
        completionRate: ((response.data.achievements?.length || 0) / Object.keys(this.achievements).length) * 100
      };
    } catch (error) {
      console.error('Get user achievements error:', error);
      return { success: false, error: error.message };
    }
  }

  // ======================
  // CHALLENGES
  // ======================

  async createChallenge(challengeData) {
    const challenge = {
      id: this.generateChallengeId(),
      name: challengeData.name,
      description: challengeData.description,
      type: challengeData.type,
      target: challengeData.target,
      reward: challengeData.reward,
      startDate: challengeData.startDate,
      endDate: challengeData.endDate,
      participants: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };

    try {
      const response = await api.post('/gamification/challenges', challenge);
      return { success: true, challenge: response.data };
    } catch (error) {
      console.error('Create challenge error:', error);
      return { success: false, error: error.message };
    }
  }

  async getActiveChallenges(userId) {
    try {
      const response = await api.get(`/gamification/challenges/active`, {
        params: { userId }
      });

      return {
        success: true,
        challenges: response.data.challenges || [],
        userProgress: response.data.userProgress || {}
      };
    } catch (error) {
      console.error('Get active challenges error:', error);
      return { success: false, error: error.message };
    }
  }

  async joinChallenge(userId, challengeId) {
    try {
      await api.post(`/gamification/challenges/${challengeId}/join`, { userId });
      return { success: true, message: 'Đã tham gia thử thách thành công!' };
    } catch (error) {
      console.error('Join challenge error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateChallengeProgress(userId, challengeId, progress) {
    try {
      await api.put(`/gamification/challenges/${challengeId}/progress`, {
        userId,
        progress,
        timestamp: new Date().toISOString()
      });

      // Check if challenge is completed
      const challenge = await this.getChallenge(challengeId);
      if (challenge.success && progress >= challenge.data.target) {
        await this.completeChallengeForUser(userId, challengeId);
      }

      return { success: true };
    } catch (error) {
      console.error('Update challenge progress error:', error);
      return { success: false, error: error.message };
    }
  }

  // ======================
  // LEADERBOARD
  // ======================

  async getLeaderboard(type = 'points', period = 'monthly', limit = 10) {
    try {
      const response = await api.get('/gamification/leaderboard', {
        params: { type, period, limit }
      });

      return {
        success: true,
        leaderboard: response.data.leaderboard || [],
        userRank: response.data.userRank || null,
        totalParticipants: response.data.totalParticipants || 0
      };
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserRank(userId, type = 'points', period = 'monthly') {
    try {
      const response = await api.get(`/gamification/users/${userId}/rank`, {
        params: { type, period }
      });

      return {
        success: true,
        rank: response.data.rank,
        score: response.data.score,
        totalParticipants: response.data.totalParticipants
      };
    } catch (error) {
      console.error('Get user rank error:', error);
      return { success: false, error: error.message };
    }
  }

  // ======================
  // REWARDS SYSTEM
  // ======================

  async getAvailableRewards(userId) {
    try {
      const userPoints = await this.getUserPoints(userId);
      if (!userPoints.success) throw new Error('Cannot get user points');

      const rewards = [
        {
          id: 'coffee_voucher',
          name: 'Voucher Cà phê',
          description: 'Voucher cà phê miễn phí tại quán',
          cost: 100,
          type: this.rewardTypes.VOUCHER,
          icon: '☕',
          available: userPoints.totalPoints >= 100
        },
        {
          id: 'lunch_voucher',
          name: 'Voucher Ăn trưa',
          description: 'Voucher ăn trưa miễn phí',
          cost: 200,
          type: this.rewardTypes.VOUCHER,
          icon: '🍽️',
          available: userPoints.totalPoints >= 200
        },
        {
          id: 'cash_bonus_50k',
          name: 'Thưởng tiền mặt 50k',
          description: 'Thưởng tiền mặt 50,000 VND',
          cost: 500,
          type: this.rewardTypes.CASH,
          icon: '💰',
          available: userPoints.totalPoints >= 500
        },
        {
          id: 'day_off',
          name: 'Ngày nghỉ phép',
          description: 'Một ngày nghỉ phép có lương',
          cost: 1000,
          type: this.rewardTypes.EXPERIENCE,
          icon: '🏖️',
          available: userPoints.totalPoints >= 1000
        },
        {
          id: 'training_course',
          name: 'Khóa đào tạo',
          description: 'Tham gia khóa đào tạo nâng cao',
          cost: 800,
          type: this.rewardTypes.EXPERIENCE,
          icon: '📚',
          available: userPoints.totalPoints >= 800
        }
      ];

      return {
        success: true,
        rewards,
        userPoints: userPoints.totalPoints
      };
    } catch (error) {
      console.error('Get available rewards error:', error);
      return { success: false, error: error.message };
    }
  }

  async redeemReward(userId, rewardId) {
    try {
      const rewards = await this.getAvailableRewards(userId);
      if (!rewards.success) throw new Error('Cannot get available rewards');

      const reward = rewards.rewards.find(r => r.id === rewardId);
      if (!reward) throw new Error('Reward not found');

      if (!reward.available) throw new Error('Insufficient points');

      // Deduct points
      await api.post('/gamification/points', {
        userId,
        action: 'REWARD_REDEEMED',
        points: -reward.cost,
        metadata: { rewardId, rewardName: reward.name },
        timestamp: new Date().toISOString()
      });

      // Create reward redemption record
      await api.post('/gamification/rewards/redemptions', {
        userId,
        rewardId,
        rewardName: reward.name,
        cost: reward.cost,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: `Đã đổi thành công ${reward.name}! Phần thưởng sẽ được xử lý trong vòng 24h.`,
        remainingPoints: rewards.userPoints - reward.cost
      };
    } catch (error) {
      console.error('Redeem reward error:', error);
      return { success: false, error: error.message };
    }
  }

  // ======================
  // UTILITY METHODS
  // ======================

  getActionDisplayName(action) {
    const displayNames = {
      SALE_COMPLETED: 'hoàn thành bán hàng',
      DAILY_TARGET_MET: 'đạt mục tiêu ngày',
      WEEKLY_TARGET_MET: 'đạt mục tiêu tuần',
      MONTHLY_TARGET_MET: 'đạt mục tiêu tháng',
      CUSTOMER_SATISFACTION: 'khách hàng hài lòng',
      TRAINING_COMPLETED: 'hoàn thành đào tạo',
      ACHIEVEMENT_UNLOCKED: 'mở khóa thành tựu'
    };

    return displayNames[action] || action;
  }

  generateChallengeId() {
    return `CHALLENGE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getUserPreviousLevel(userId) {
    // Mock implementation - in real app, this would query database
    return 1;
  }

  async awardLevelUpBonus(userId, level) {
    return this.awardPoints(userId, 'LEVEL_UP_BONUS', { level, points: level * 50 });
  }

  async userHasAchievement(userId, achievementId) {
    // Mock implementation - in real app, this would query database
    return false;
  }

  async checkSalesStreak(userId, days) {
    // Mock implementation - in real app, this would check sales data
    return Math.random() > 0.7;
  }

  async checkCustomerSatisfaction(userId, percentage) {
    // Mock implementation - in real app, this would check satisfaction data
    return Math.random() > 0.8;
  }

  async checkTopSeller(userId, months) {
    // Mock implementation - in real app, this would check sales rankings
    return Math.random() > 0.9;
  }

  async checkTrainingCompletion(userId) {
    // Mock implementation - in real app, this would check training records
    return Math.random() > 0.6;
  }

  async getChallenge(challengeId) {
    try {
      const response = await api.get(`/gamification/challenges/${challengeId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async completeChallengeForUser(userId, challengeId) {
    try {
      await api.post(`/gamification/challenges/${challengeId}/complete`, { userId });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
export const gamificationService = new GamificationService();

// Export individual methods for convenience
export const {
  awardPoints,
  getUserPoints,
  checkAchievements,
  getLeaderboard,
  getAvailableRewards,
  redeemReward,
  createChallenge,
  getActiveChallenges
} = gamificationService; 