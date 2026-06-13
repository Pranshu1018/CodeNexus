import { useState, useEffect } from 'react';
import { X, Check, CreditCard, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import subscriptionService from '../services/subscriptionService';
import API_BASE_URL from '../config/api';

// Razorpay configuration
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

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

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      // Check if already loaded
      if (window.Razorpay) {
        console.log("Razorpay script already loaded");
        resolve(true);
        return;
      }

      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        existingScript.onload = () => resolve(true);
        existingScript.onerror = () => resolve(false);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve(true);
      };
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  // Process payment with Razorpay
  const processPayment = async (subscriptionData) => {
    try {
      console.log("Starting payment process with data:", subscriptionData);
      setIsProcessingPayment(true);
      
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay. Please check your internet connection.');
      }

      // Verify Razorpay is available
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not loaded. Please refresh the page and try again.');
      }

      console.log("Creating order with amount:", subscriptionData.planPrice);

      // Create order on backend using environment variable
      const orderResponse = await fetch(`${API_BASE_URL}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: subscriptionData.planPrice,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!orderResponse.ok) {
        const errorText = await orderResponse.text();
        console.error("Order creation failed:", errorText);
        throw new Error('Failed to create payment order. Please ensure the backend server is running.');
      }

      const order = await orderResponse.json();
      console.log('Order created successfully:', order);

      if (!order.id) {
        throw new Error('Invalid order response from server');
      }

      // Razorpay checkout options
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: subscriptionData.planPrice * 100, // Convert to paise
        currency: 'INR',
        name: 'CodeNexus',
        description: subscriptionData.planName,
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log('Payment successful, validating...', response);
            
            // Validate payment on backend using environment variable
            const validateResponse = await fetch(`${API_BASE_URL}/order/validate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const validateData = await validateResponse.json();
            console.log('Validation response:', validateData);

            if (validateData.valid) {
              // Payment verified successfully
              console.log('Payment verified successfully!');

              // Save subscription with payment details
              const fullSubscriptionData = {
                ...subscriptionData,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                paymentStatus: 'completed',
                paymentDate: new Date().toISOString(),
              };

              const result = subscriptionService.saveSubscription(fullSubscriptionData);

              if (result.success) {
                // Mark modal as seen
                subscriptionService.setModalSeen();
                
                // Show success message
                alert(` Payment Successful!\n\nPlan: ${subscriptionData.planName}\nAmount: ₹${subscriptionData.planPrice}\nPayment ID: ${response.razorpay_payment_id}`);
                
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
                  navigate('/courses');
                }
              } else {
                throw new Error('Failed to save subscription data');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            alert('Payment verification failed. Please contact support with your payment ID: ' + response.razorpay_payment_id);
          } finally {
            setIsProcessingPayment(false);
            setIsLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          subscriptionType: subscriptionData.subscriptionType,
          courseName: subscriptionData.courseName || 'N/A',
        },
        theme: {
          color: '#10b981', // Green theme matching your site
        },
        modal: {
          ondismiss: function() {
            setIsProcessingPayment(false);
            setIsLoading(false);
            console.log('Payment cancelled by user');
          }
        }
      };

      console.log("Opening Razorpay checkout with options:", options);

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setIsProcessingPayment(false);
        setIsLoading(false);
        alert(`Payment Failed!\n\nReason: ${response.error.description}\nPlease try again.`);
      });

      razorpay.open();

    } catch (error) {
      console.error('Payment processing error:', error);
      setIsProcessingPayment(false);
      setIsLoading(false);
      setError(error.message || 'Payment processing failed. Please try again.');
    }
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

      // Process payment through Razorpay
      await processPayment(subscriptionData);

    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError('An error occurred while processing your subscription');
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
                disabled={isLoading || isProcessingPayment}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessingPayment ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Payment...
                  </span>
                ) : isLoading ? (
                  'Validating...'
                ) : (
                  `Pay ₹${plans[selectedPlan].price} - Subscribe Now`
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading || isProcessingPayment}
                className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
            
            {/* Payment security badge */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center justify-center text-sm text-gray-400">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by Razorpay - India's Most Trusted Payment Gateway
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
