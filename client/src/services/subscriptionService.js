// Subscription Service for managing subscription data

export const subscriptionService = {
  // Save subscription data
  saveSubscription: (subscriptionData) => {
    try {
      const existingSubscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      existingSubscriptions.push({
        ...subscriptionData,
        id: Date.now(),
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('subscriptions', JSON.stringify(existingSubscriptions));
      return { success: true, data: subscriptionData };
    } catch (error) {
      console.error('Error saving subscription:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all subscriptions
  getAllSubscriptions: () => {
    try {
      return JSON.parse(localStorage.getItem('subscriptions') || '[]');
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  },

  // Get subscription by email
  getSubscriptionByEmail: (email) => {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      return subscriptions.filter(sub => sub.email === email);
    } catch (error) {
      console.error('Error getting subscription by email:', error);
      return [];
    }
  },

  // Check if user has active subscription
  hasActiveSubscription: (email) => {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      return subscriptions.some(sub => sub.email === email);
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  },

  // Mark modal as seen
  setModalSeen: () => {
    localStorage.setItem('hasSeenSubscriptionModal', 'true');
  },

  // Check if modal has been seen
  hasSeenModal: () => {
    return localStorage.getItem('hasSeenSubscriptionModal') === 'true';
  },

  // Reset modal seen status (for testing)
  resetModalSeen: () => {
    localStorage.removeItem('hasSeenSubscriptionModal');
  },

  // Clear all subscriptions (for testing)
  clearAllSubscriptions: () => {
    localStorage.removeItem('subscriptions');
  },

  // Get subscription statistics
  getSubscriptionStats: () => {
    try {
      const subscriptions = JSON.parse(localStorage.getItem('subscriptions') || '[]');
      const monthly = subscriptions.filter(sub => sub.subscriptionType === 'monthly').length;
      const course = subscriptions.filter(sub => sub.subscriptionType === 'course').length;
      
      return {
        total: subscriptions.length,
        monthly,
        course,
        revenue: subscriptions.reduce((sum, sub) => {
          return sum + (sub.planDetails?.price || 0);
        }, 0)
      };
    } catch (error) {
      console.error('Error getting subscription stats:', error);
      return { total: 0, monthly: 0, course: 0, revenue: 0 };
    }
  }
};

export default subscriptionService;
