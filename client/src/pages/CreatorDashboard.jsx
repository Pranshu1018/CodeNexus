import { useState, useEffect } from 'react';
import { 
  Plus, 
  Video, 
  Edit, 
  Trash2, 
  Upload, 
  Play, 
  Users, 
  Star, 
  BookOpen, 
  Calendar,
  DollarSign,
  Eye,
  X,
  Save,
  FileVideo,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { getUserInfo } from '../hooks/getUserInfo';
import { 
  createCourse, 
  getCoursesByCreator, 
  updateCourse, 
  deleteCourse,
  submitCourseForReview,
  publishCourse,
  addVideoToCourse,
  deleteVideoFromCourse,
  COURSE_STATUS
} from '../services/courseService';

// Mock data for creator's courses
const mockCreatorCourses = [
  {
    id: 1,
    title: "Complete Frontend Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, and React with hands-on projects and exercises.",
    thumbnail: "/placeholder.svg?height=300&width=400",
    category: "Frontend",
    price: 1499,
    students: 245,
    rating: 4.8,
    status: "published",
    createdAt: "2024-01-15",
    videos: [
      { id: 1, title: "Introduction to HTML", duration: "15:30", status: "published" },
      { id: 2, title: "CSS Fundamentals", duration: "22:45", status: "published" },
      { id: 3, title: "JavaScript Basics", duration: "18:20", status: "draft" }
    ]
  },
  {
    id: 2,
    title: "React Advanced Concepts",
    description: "Deep dive into React hooks, context, and advanced patterns.",
    thumbnail: "/placeholder.svg?height=300&width=400",
    category: "React",
    price: 1799,
    students: 156,
    rating: 4.9,
    status: "published",
    createdAt: "2024-02-20",
    videos: [
      { id: 1, title: "React Hooks Deep Dive", duration: "25:10", status: "published" },
      { id: 2, title: "Context API Mastery", duration: "19:35", status: "published" }
    ]
  }
];

const CreatorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { userId } = getUserInfo();

  // Fetch creator's courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        const creatorCourses = await getCoursesByCreator(userId);
        setCourses(creatorCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [userId]);

  // New course form data
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    thumbnail: ''
  });

  // New video form data
  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    duration: '',
    videoUrl: ''
  });

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    
    // Debug: Check if user is logged in
    console.log('User ID:', userId);
    console.log('Auth Info:', localStorage.getItem('authInfo'));
    
    if (!userId) {
      alert('You must be logged in to create a course. Please login first.');
      return;
    }
    
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        category: newCourse.category,
        price: parseInt(newCourse.price),
        thumbnail: newCourse.thumbnail || '/placeholder.svg',
        videos: []
      };

      console.log('Creating course with data:', courseData);
      const createdCourse = await createCourse(courseData, userId);
      console.log('Course created successfully:', createdCourse);

      setCourses([createdCourse, ...courses]);
      setNewCourse({ title: '', description: '', category: '', price: '', thumbnail: '' });
      setShowCreateModal(false);
      alert('Course created successfully!');
    } catch (error) {
      console.error('Error creating course:', error);
      console.error('Error details:', error.message, error.code);
      alert(`Failed to create course: ${error.message}`);
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      const videoData = {
        title: newVideo.title,
        description: newVideo.description,
        duration: newVideo.duration,
        url: newVideo.videoUrl
      };

      const addedVideo = await addVideoToCourse(selectedCourse.id, videoData);

      const updatedCourses = courses.map(course => 
        course.id === selectedCourse.id 
          ? { ...course, videos: [...(course.videos || []), addedVideo] }
          : course
      );
      
      setCourses(updatedCourses);
      setSelectedCourse({ ...selectedCourse, videos: [...(selectedCourse.videos || []), addedVideo] });
      setNewVideo({ title: '', description: '', duration: '', videoUrl: '' });
      setShowVideoModal(false);
      alert('Video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      alert('Failed to add video. Please try again.');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await deleteCourse(courseId);
      setCourses(courses.filter(course => course.id !== courseId));
      alert('Course deleted successfully!');
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('Failed to delete course. Please try again.');
    }
  };

  const handleDeleteVideo = async (courseId, videoId) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await deleteVideoFromCourse(courseId, videoId);
      
      const updatedCourses = courses.map(course => 
        course.id === courseId 
          ? { ...course, videos: (course.videos || []).filter(video => video.id !== videoId) }
          : course
      );
      setCourses(updatedCourses);
      
      if (selectedCourse && selectedCourse.id === courseId) {
        setSelectedCourse({ 
          ...selectedCourse, 
          videos: (selectedCourse.videos || []).filter(video => video.id !== videoId) 
        });
      }
      
      alert('Video deleted successfully!');
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video. Please try again.');
    }
  };

  const handleSubmitForReview = async (courseId) => {
    try {
      setLoading(true);
      alert('Submitting course for automated review... This may take a few moments.');
      
      const analysis = await submitCourseForReview(courseId);
      
      // Refresh the course data to get updated status
      const updatedCourse = await getCoursesByCreator(userId);
      setCourses(updatedCourse);
      
      if (analysis.autoApprove) {
        alert(`🎉 Congratulations! Your course scored ${analysis.overallScore}/100 and has been auto-approved! You can now publish it.`);
      } else if (analysis.overallScore >= 50) {
        alert(`Course submitted for admin review. Score: ${analysis.overallScore}/100. An admin will review it soon.`);
      } else {
        alert(`Course needs improvement. Score: ${analysis.overallScore}/100. Please check the suggestions and resubmit.`);
      }
    } catch (error) {
      console.error('Error submitting course:', error);
      alert('Failed to submit course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      await publishCourse(courseId);
      const updatedCourses = courses.map(course => 
        course.id === courseId ? { ...course, status: COURSE_STATUS.PUBLISHED } : course
      );
      setCourses(updatedCourses);
      alert('Course published successfully!');
    } catch (error) {
      console.error('Error publishing course:', error);
      alert(error.message || 'Failed to publish course. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      [COURSE_STATUS.DRAFT]: { 
        text: 'Draft', 
        className: 'bg-gray-500 text-white',
        icon: Edit
      },
      [COURSE_STATUS.UNDER_REVIEW]: { 
        text: 'Under Automated Review', 
        className: 'bg-purple-500 text-white animate-pulse',
        icon: AlertCircle
      },
      [COURSE_STATUS.PENDING]: { 
        text: 'Pending Manual Review', 
        className: 'bg-yellow-500 text-gray-900',
        icon: AlertCircle
      },
      [COURSE_STATUS.AUTO_APPROVED]: { 
        text: 'Auto-Approved ✨', 
        className: 'bg-cyan-500 text-white',
        icon: CheckCircle
      },
      [COURSE_STATUS.APPROVED]: { 
        text: 'Approved', 
        className: 'bg-blue-500 text-white',
        icon: CheckCircle
      },
      [COURSE_STATUS.REJECTED]: { 
        text: 'Rejected', 
        className: 'bg-red-500 text-white',
        icon: XCircle
      },
      [COURSE_STATUS.PUBLISHED]: { 
        text: 'Published', 
        className: 'bg-green-500 text-white',
        icon: CheckCircle
      }
    };
    return badges[status] || badges[COURSE_STATUS.DRAFT];
  };

  const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);
  const totalRevenue = courses.reduce((sum, course) => sum + ((course.students || 0) * (course.price || 0)), 0);
  const avgRating = courses.length > 0 
    ? (courses.reduce((sum, course) => sum + (course.rating || 0), 0) / courses.length).toFixed(1)
    : 0;

  return (
    <div className="bg-gray-900 min-h-screen text-white mt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-4">
            Creator Dashboard
          </h1>
          <p className="text-gray-300">Manage your courses and track your success</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-white">{courses.length}</p>
              </div>
              <BookOpen className="w-10 h-10 text-blue-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Students</p>
                <p className="text-3xl font-bold text-white">{totalStudents}</p>
              </div>
              <Users className="w-10 h-10 text-green-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Avg Rating</p>
                <p className="text-3xl font-bold text-white">{avgRating}</p>
              </div>
              <Star className="w-10 h-10 text-yellow-300" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white">My Courses</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Course
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {courses.map((course) => {
            const statusBadge = getStatusBadge(course.status);
            const StatusIcon = statusBadge.icon;
            
            return (
            <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={course.thumbnail || '/placeholder.svg'} 
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusBadge.className}`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                
                {/* Analysis Score Display */}
                {course.analysisResult && (
                  <div className="mb-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Quality Score</span>
                      <span className={`text-lg font-bold ${
                        course.analysisResult.overallScore >= 70 ? 'text-green-400' :
                        course.analysisResult.overallScore >= 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {course.analysisResult.overallScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          course.analysisResult.overallScore >= 70 ? 'bg-green-500' :
                          course.analysisResult.overallScore >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${course.analysisResult.overallScore}%` }}
                      />
                    </div>
                    {course.analysisResult.completeness?.suggestions?.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-400 cursor-pointer hover:text-blue-300">
                          View Suggestions ({course.analysisResult.completeness.suggestions.length})
                        </summary>
                        <ul className="mt-2 text-xs text-gray-400 space-y-1 pl-4">
                          {course.analysisResult.completeness.suggestions.slice(0, 3).map((suggestion, idx) => (
                            <li key={idx}>• {suggestion}</li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold text-green-500">₹{course.price}</span>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.students}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 mr-1 text-yellow-500" />
                      {course.rating}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-500">{(course.videos || []).length} videos</span>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setSelectedCourse(course)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                      title="Manage Videos"
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Course Actions based on status */}
                <div className="space-y-2">
                  {course.status === COURSE_STATUS.DRAFT && (
                    <button
                      onClick={() => handleSubmitForReview(course.id)}
                      className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Submit for Automated Review
                    </button>
                  )}
                  
                  {course.status === COURSE_STATUS.UNDER_REVIEW && (
                    <div className="p-3 bg-purple-900/30 border border-purple-500 rounded-lg">
                      <p className="text-sm text-purple-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 animate-pulse" />
                        AI is analyzing your course content...
                      </p>
                    </div>
                  )}
                  
                  {(course.status === COURSE_STATUS.APPROVED || course.status === COURSE_STATUS.AUTO_APPROVED) && (
                    <button
                      onClick={() => handlePublishCourse(course.id)}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Publish Course
                    </button>
                  )}
                  
                  {course.status === COURSE_STATUS.PENDING && (
                    <div className="p-3 bg-yellow-900/30 border border-yellow-500 rounded-lg">
                      <p className="text-sm text-yellow-300">
                        ⏳ Waiting for admin review. You'll be notified once reviewed.
                      </p>
                    </div>
                  )}
                  
                  {course.status === COURSE_STATUS.REJECTED && course.rejectionReason && (
                    <div className="p-3 bg-red-900/30 border border-red-500 rounded-lg">
                      <p className="text-sm text-red-300">
                        <strong>Rejection Reason:</strong> {course.rejectionReason}
                      </p>
                      <button
                        onClick={() => handleSubmitForReview(course.id)}
                        className="mt-2 w-full px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                      >
                        Resubmit After Fixes
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            );
          })}
        </div>

        {/* Create Course Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">Create New Course</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course Title *</label>
                  <input
                    type="text"
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter course title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                  <textarea
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="Enter course description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                    <select
                      value={newCourse.category}
                      onChange={(e) => setNewCourse({...newCourse, category: e.target.value})}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    >
                      <option value="">Select Category</option>
                      <option value="Frontend">Frontend</option>
                      <option value="Backend">Backend</option>
                      <option value="Full Stack">Full Stack</option>
                      <option value="Mobile">Mobile Development</option>
                      <option value="Data Science">Data Science</option>
                      <option value="DevOps">DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={newCourse.price}
                      onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value)})}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                      placeholder="Enter price"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Course Thumbnail URL</label>
                  <input
                    type="url"
                    value={newCourse.thumbnail}
                    onChange={(e) => setNewCourse({...newCourse, thumbnail: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="https://example.com/image.jpg (or leave empty for placeholder)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use image hosting services like Imgur, Cloudinary, or direct image URLs</p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
                  >
                    Create Course
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Course Videos Management Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold gradient-text">{selectedCourse.title}</h2>
                  <p className="text-gray-400">Manage course videos</p>
                </div>
                <button 
                  onClick={() => setSelectedCourse(null)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">Videos ({(selectedCourse.videos || []).length})</h3>
                  <button
                    onClick={() => setShowVideoModal(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-lg transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Video
                  </button>
                </div>

                <div className="space-y-4">
                  {(selectedCourse.videos || []).map((video) => (
                    <div key={video.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-white mb-1">{video.title}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {video.duration}
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              video.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-gray-900'
                            }`}>
                              {video.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors" title="Preview">
                            <Play className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteVideo(selectedCourse.id, video.id)}
                            className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {selectedCourse.videos.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <FileVideo className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>No videos uploaded yet</p>
                      <p className="text-sm">Click "Add Video" to get started</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Video Modal */}
        {showVideoModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold gradient-text">Add New Video</h2>
                <button 
                  onClick={() => setShowVideoModal(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddVideo} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video Title *</label>
                  <input
                    type="text"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                    required
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter video title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Enter video description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Duration *</label>
                  <input
                    type="text"
                    value={newVideo.duration}
                    onChange={(e) => setNewVideo({...newVideo, duration: e.target.value})}
                    required
                    placeholder="e.g., 15:30"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Video URL *</label>
                  <input
                    type="url"
                    value={newVideo.videoUrl}
                    onChange={(e) => setNewVideo({...newVideo, videoUrl: e.target.value})}
                    required
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Use YouTube, Vimeo, or any direct video URL</p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(false)}
                    className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatorDashboard;