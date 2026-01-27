import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Clock,
  BookOpen,
  Users,
  AlertCircle,
  Video,
  DollarSign,
  TrendingUp,
  Award,
  FileText,
  Play,
  ExternalLink
} from 'lucide-react';
import { 
  getPendingCourses, 
  approveCourse, 
  rejectCourse,
  getCourseById,
  COURSE_STATUS 
} from '../services/courseService';
import { getUserInfo } from '../hooks/getUserInfo';

const AdminDashboard = () => {
  const [pendingCourses, setPendingCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(true);
  const { userId } = getUserInfo();

  useEffect(() => {
    fetchPendingCourses();
  }, []);

  const fetchPendingCourses = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending courses...');
      const courses = await getPendingCourses();
      console.log('Fetched courses:', courses);
      setPendingCourses(courses);
    } catch (error) {
      console.error('Error fetching pending courses:', error);
      console.error('Error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveCourse = async (courseId) => {
    if (!confirm('Are you sure you want to approve this course?')) return;
    
    try {
      await approveCourse(courseId, userId);
      setPendingCourses(pendingCourses.filter(c => c.id !== courseId));
      setSelectedCourse(null);
      alert('Course approved successfully!');
    } catch (error) {
      console.error('Error approving course:', error);
      alert('Failed to approve course. Please try again.');
    }
  };

  const handleRejectCourse = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason.');
      return;
    }

    try {
      await rejectCourse(selectedCourse.id, userId, rejectionReason);
      setPendingCourses(pendingCourses.filter(c => c.id !== selectedCourse.id));
      setSelectedCourse(null);
      setShowRejectModal(false);
      setRejectionReason('');
      alert('Course rejected successfully!');
    } catch (error) {
      console.error('Error rejecting course:', error);
      alert('Failed to reject course. Please try again.');
    }
  };

  const handleViewCourse = async (courseId) => {
    try {
      const course = await getCourseById(courseId);
      setSelectedCourse(course);
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('Failed to load course details.');
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white mt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 to-purple-900 p-6">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Review and approve courses</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-200 text-sm">Pending Reviews</p>
                <p className="text-3xl font-bold text-white">{pendingCourses.length}</p>
              </div>
              <AlertCircle className="w-10 h-10 text-yellow-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Total Courses</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <BookOpen className="w-10 h-10 text-green-300" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white">-</p>
              </div>
              <Users className="w-10 h-10 text-blue-300" />
            </div>
          </div>
        </div>

        {/* Pending Courses */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Courses Pending Review</h2>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              <p className="mt-4 text-gray-400">Loading courses...</p>
            </div>
          ) : pendingCourses.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <p className="text-gray-400">No courses pending review</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCourses.map((course) => (
                <div key={course.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={course.thumbnail || '/placeholder.svg'} 
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-gray-900 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">{course.description}</p>
                    
                    {/* Analysis Score */}
                    {course.analysisResult && (
                      <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-300">Quality Score</span>
                          <span className={`text-lg font-bold ${
                            course.analysisResult.overallScore >= 70 ? 'text-green-400' :
                            course.analysisResult.overallScore >= 50 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {course.analysisResult.overallScore}/100
                          </span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              course.analysisResult.overallScore >= 70 ? 'bg-green-500' :
                              course.analysisResult.overallScore >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${course.analysisResult.overallScore}%` }}
                          />
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <Award className="w-3 h-3" />
                          <span className="text-gray-400">{course.analysisResult.recommendation}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-green-500">₹{course.price}</span>
                      <div className="flex items-center text-sm text-gray-400">
                        <Video className="w-4 h-4 mr-1" />
                        {(course.videos || []).length} videos
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleViewCourse(course.id)}
                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Review Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Course Review Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold gradient-text mb-2">{selectedCourse.title}</h2>
              <p className="text-gray-400">{selectedCourse.category}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* AI Analysis Results */}
              {selectedCourse.analysisResult && (
                <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-4 rounded-lg border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Automated Analysis Results
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Overall Score</p>
                      <p className={`text-3xl font-bold ${
                        selectedCourse.analysisResult.overallScore >= 70 ? 'text-green-400' :
                        selectedCourse.analysisResult.overallScore >= 50 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedCourse.analysisResult.overallScore}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Completeness</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {selectedCourse.analysisResult.completeness?.score || 0}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-400 mb-1">Alignment</p>
                      <p className="text-3xl font-bold text-purple-400">
                        {selectedCourse.analysisResult.alignment?.score || 0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Recommendation:</span>
                      <span className={`font-semibold ${
                        selectedCourse.analysisResult.recommendation === 'AUTO_APPROVE' ? 'text-green-400' :
                        selectedCourse.analysisResult.recommendation === 'MANUAL_REVIEW' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {selectedCourse.analysisResult.recommendation}
                      </span>
                    </div>
                    
                    {selectedCourse.analysisResult.completeness?.issues?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-red-400 font-semibold mb-1">Issues Found:</p>
                        <ul className="text-xs text-gray-400 space-y-1">
                          {selectedCourse.analysisResult.completeness.issues.map((issue, idx) => (
                            <li key={idx}>• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Course Details */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-gray-300">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Price</h3>
                  <p className="text-xl font-bold text-green-500">₹{selectedCourse.price}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Videos</h3>
                  <p className="text-xl font-bold text-white">{(selectedCourse.videos || []).length}</p>
                </div>
              </div>

              {/* Videos List */}
              {selectedCourse.videos && selectedCourse.videos.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <Video className="w-5 h-5" />
                    Course Content ({selectedCourse.videos.length} videos)
                  </h3>
                  <div className="space-y-3">
                    {selectedCourse.videos.map((video, index) => {
                      const metadata = selectedCourse.videosWithMetadata?.find(v => v.id === video.id)?.metadata;
                      return (
                        <div key={video.id} className="bg-gray-800 p-4 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">
                                {index + 1}. {video.title}
                              </p>
                              {video.description && (
                                <p className="text-sm text-gray-400 mb-2">{video.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>Duration: {video.duration}</span>
                                {metadata?.platform && (
                                  <span className="px-2 py-1 bg-gray-700 rounded">
                                    {metadata.platform.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {metadata?.title && metadata.title !== video.title && (
                                <p className="text-xs text-yellow-400 mt-2">
                                  ⚠️ Video title mismatch: "{metadata.title}"
                                </p>
                              )}
                            </div>
                            {video.url && (
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-4 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-2 transition-colors"
                              >
                                <Play className="w-4 h-4" />
                                Watch
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-gray-800">
                <button
                  onClick={() => handleApproveCourse(selectedCourse.id)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve Course
                </button>
                
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
                  Reject Course
                </button>
                
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-red-500">Reject Course</h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                  placeholder="Please provide a detailed reason for rejection..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleRejectCourse}
                  className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
