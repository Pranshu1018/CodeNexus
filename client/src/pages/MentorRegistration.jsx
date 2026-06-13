import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Award, 
  Briefcase, 
  BookOpen, 
  Clock, 
  DollarSign,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import { createMentor } from '../services/mentorService';

const MentorRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { userId, isAuth } = getUserInfo();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    expertise: [],
    experience: '',
    hourlyRate: '',
    availability: [],
    linkedin: '',
    github: '',
    portfolio: '',
    company: '',
    jobTitle: ''
  });

  const [newExpertise, setNewExpertise] = useState('');
  
  const expertiseOptions = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'C++', 'Go', 'Rust', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes',
    'System Design', 'Data Structures', 'Algorithms', 'Web Development',
    'Mobile Development', 'DevOps', 'Machine Learning', 'AI', 'Cybersecurity'
  ];

  const availabilityOptions = [
    'Monday Morning', 'Monday Afternoon', 'Monday Evening',
    'Tuesday Morning', 'Tuesday Afternoon', 'Tuesday Evening',
    'Wednesday Morning', 'Wednesday Afternoon', 'Wednesday Evening',
    'Thursday Morning', 'Thursday Afternoon', 'Thursday Evening',
    'Friday Morning', 'Friday Afternoon', 'Friday Evening',
    'Saturday Morning', 'Saturday Afternoon', 'Saturday Evening',
    'Sunday Morning', 'Sunday Afternoon', 'Sunday Evening'
  ];

  useEffect(() => {
    if (!isAuth) {
      navigate('/login');
    }
  }, [isAuth, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddExpertise = (expertise) => {
    if (!formData.expertise.includes(expertise)) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, expertise]
      }));
    }
  };

  const handleRemoveExpertise = (expertise) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter(e => e !== expertise)
    }));
  };

  const handleAddCustomExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleToggleAvailability = (slot) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(slot)
        ? prev.availability.filter(s => s !== slot)
        : [...prev.availability, slot]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.name || !formData.email || !formData.bio) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (formData.expertise.length === 0) {
      setError('Please add at least one area of expertise');
      setLoading(false);
      return;
    }

    if (formData.availability.length === 0) {
      setError('Please select at least one availability slot');
      setLoading(false);
      return;
    }

    try {
      const mentorData = {
        ...formData,
        userId,
        experience: parseInt(formData.experience) || 0,
        hourlyRate: parseFloat(formData.hourlyRate) || 0
      };

      await createMentor(mentorData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error registering as mentor:', error);
      setError('Failed to register as mentor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center pt-20">
        <div className="max-w-md w-full bg-gray-800 rounded-lg border border-green-500 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
          <p className="text-gray-300 mb-4">
            Your mentor application has been submitted successfully. Our team will review your profile and get back to you within 2-3 business days.
          </p>
          <p className="text-sm text-gray-400">
            Redirecting to home page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Become a Mentor
          </h1>
          <p className="text-gray-400 text-lg">
            Share your knowledge and help aspiring developers grow their skills. Fill out this application to join our mentor community.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-900/30 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6 text-purple-400" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Company</label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Google"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Job Title</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Senior Software Engineer"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Bio *</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Tell us about your experience, teaching style, and what motivates you to mentor..."
              />
            </div>
          </div>

          {/* Expertise */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-purple-400" />
              Areas of Expertise *
            </h2>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-3">Select from common skills:</p>
              <div className="flex flex-wrap gap-2">
                {expertiseOptions.map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => handleAddExpertise(exp)}
                    disabled={formData.expertise.includes(exp)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      formData.expertise.includes(exp)
                        ? 'bg-purple-600 text-white cursor-default'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Or add custom skills:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newExpertise}
                  onChange={(e) => setNewExpertise(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="Enter a skill"
                />
                <button
                  type="button"
                  onClick={handleAddCustomExpertise}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {formData.expertise.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Selected expertise:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.expertise.map((exp) => (
                    <span
                      key={exp}
                      className="px-3 py-1 bg-purple-600 text-white rounded-full text-sm flex items-center gap-2"
                    >
                      {exp}
                      <button
                        type="button"
                        onClick={() => handleRemoveExpertise(exp)}
                        className="hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Experience & Rates */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-400" />
              Experience & Rates
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Hourly Rate (USD)
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="50"
                />
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-purple-400" />
              Availability *
            </h2>

            <p className="text-sm text-gray-400 mb-4">Select all time slots when you're typically available:</p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {availabilityOptions.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => handleToggleAvailability(slot)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    formData.availability.includes(slot)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Social Links (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">LinkedIn Profile</label>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">GitHub Profile</label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://github.com/yourusername"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Portfolio Website</label>
                <input
                  type="url"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="https://yourportfolio.com"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MentorRegistration;
