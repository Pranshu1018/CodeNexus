import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';

const SubscriptionModal = ({ isOpen, onClose, type = 'both', courseName = '', coursePrice = 0, courseId = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subscriptionType: type === 'course' ? 'course' : 'monthly',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedPlan, setSelectedPlan] = useState(type === 'course' ? 'course' : 'monthly');

  // Subscription plans
  const plans = {
    monthly: {
      name: 'Monthly Subscription',
      price: 999,
      duration: 'per month',
      features: [
        'Access to all courses',
        'Live doubt solving sessions',
        'Daily coding challenges',
        'Certificate of completion',
        'Community access',
        'Priority support'
      ],
      icon: <Calendar className="w-6 h-6" />,
      color: 'green'
    },
    course: {
      name: courseName || 'Course Access',
      price: coursePrice || 1499,
      duration: 'one-time payment',
      features: [
        'Lifetime course access',
        'Course materials & resources',
        'Certificate of completion',
        'Community access',
        'Course updates'
      ],
      icon: <CreditCard className="w-6 h-6" />,
      color: 'blue'
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error on input change
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    // Validate phone (10 digits)
    if (!/^\d{10}$/.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      setIsLoading(false);
      return;
    }
    
    try {
      // Create subscription data
      const subscriptionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subscriptionType: selectedPlan,
        planName: plans[selectedPlan].name,
        planPrice: plans[selectedPlan].price,
        planDuration: plans[selectedPlan].duration,
        courseId: courseId,
        courseName: courseName
      };

      // Save subscription
      const result = subscriptionService.saveSubscription(subscriptionData);

      if (result.success) {
        // Mark modal as seen
        subscriptionService.setModalSeen();
        
        // Show success message
        alert(`Subscription successful! Plan: ${plans[selectedPlan].name}`);
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          subscriptionType: selectedPlan
        });

        // Navigate based on subscription type
        if (selectedPlan === 'course' && courseId) {
          onClose();
          navigate(`/course-content/${courseId}`);
        } else {
          onClose();
        }
      } else {
        setError(result.error || 'Failed to save subscription');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('An error occurred while processing your subscription');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-3xl font-bold gradient-text">Choose Your Subscription</h2>
          <p className="text-gray-400 mt-2">Select a plan that works best for you</p>
        </div>

        <div className="p-6">
          {/* Plan Selection (only show if both types are available) */}
          {type === 'both' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Monthly Plan */}
              <div
                onClick={() => setSelectedPlan('monthly')}
                className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlan === 'monthly'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500/20 rounded-lg text-green-500">
                      {plans.monthly.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plans.monthly.name}</h3>
                      <p className="text-sm text-gray-400">{plans.monthly.duration}</p>
                    </div>
                  </div>
                  {selectedPlan === 'monthly' && (
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-green-500 mb-4">
                  ₹{plans.monthly.price}
                  <span className="text-sm text-gray-400 font-normal"> /month</span>
                </div>
                <ul className="space-y-2">
                  {plans.monthly.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <Check className="w-4 h-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Course Plan */}
              <div
                onClick={() => setSelectedPlan('course')}
                className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 ${
                  selectedPlan === 'course'
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500/20 rounded-lg text-blue-500">
                      {plans.course.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{plans.course.name}</h3>
                      <p className="text-sm text-gray-400">{plans.course.duration}</p>
                    </div>
                  </div>
                  {selectedPlan === 'course' && (
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-blue-500 mb-4">
                  ₹{plans.course.price}
                  <span className="text-sm text-gray-400 font-normal"> one-time</span>
                </div>
                <ul className="space-y-2">
                  {plans.course.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-300">
                      <Check className="w-4 h-4 text-blue-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Show single plan details if type is specific */}
          {type !== 'both' && (
            <div className="mb-8 p-6 rounded-xl border-2 border-gray-700 bg-gray-800/50">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 bg-${plans[selectedPlan].color}-500/20 rounded-lg text-${plans[selectedPlan].color}-500`}>
                  {plans[selectedPlan].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{plans[selectedPlan].name}</h3>
                  <p className="text-gray-400">{plans[selectedPlan].duration}</p>
                </div>
              </div>
              <div className={`text-4xl font-bold text-${plans[selectedPlan].color}-500 mb-4`}>
                ₹{plans[selectedPlan].price}
              </div>
              <ul className="space-y-2">
                {plans[selectedPlan].features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-300">
                    <Check className={`w-5 h-5 text-${plans[selectedPlan].color}-500 mr-2`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Enter 10-digit phone number"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? 'Processing...' : `Subscribe Now - ₹${plans[selectedPlan].price}`}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
