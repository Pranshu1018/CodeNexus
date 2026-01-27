import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Play, CheckCircle, Lock, Clock, BookOpen, User, Star, Loader } from "lucide-react";
import { getCourseById } from '../services/courseService';
import { getUserInfo } from '../hooks/getUserInfo';

// Static course data (same as CourseDetailsPage for consistency)
const courses = [
  {
    id: 1,
    title: "Complete Frontend Development Bootcamp",
    description: "Master HTML, CSS, JavaScript, and React with hands-on projects and exercises.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    students: 3245,
    rating: 4.8,
    instructor: "John Doe",
    startDate: "April 15, 2025",
    category: "frontend",
    tags: ["HTML", "CSS", "JavaScript", "React"],
    videos: [
      {
        id: 1,
        title: "Introduction to HTML Basics",
        duration: "15:30",
        description: "Learn the fundamentals of HTML structure and elements",
        completed: true,
        module: "HTML & CSS Basics"
      },
      {
        id: 2,
        title: "CSS Styling and Selectors",
        duration: "22:45",
        description: "Master CSS selectors and basic styling techniques",
        completed: true,
        module: "HTML & CSS Basics"
      },
      {
        id: 3,
        title: "CSS Flexbox Layout",
        duration: "18:20",
        description: "Understanding flexbox for modern layouts",
        completed: false,
        module: "HTML & CSS Basics"
      },
      {
        id: 4,
        title: "Responsive Design Principles",
        duration: "25:10",
        description: "Creating websites that work on all devices",
        completed: false,
        module: "Responsive Web Design"
      },
      {
        id: 5,
        title: "Media Queries and Breakpoints",
        duration: "19:35",
        description: "Implementing responsive breakpoints effectively",
        completed: false,
        module: "Responsive Web Design"
      },
      {
        id: 6,
        title: "JavaScript Variables and Data Types",
        duration: "16:45",
        description: "Understanding JavaScript basics and data types",
        completed: false,
        module: "JavaScript Fundamentals"
      },
      {
        id: 7,
        title: "Functions and Scope",
        duration: "21:30",
        description: "Mastering JavaScript functions and variable scope",
        completed: false,
        module: "JavaScript Fundamentals"
      },
      {
        id: 8,
        title: "DOM Manipulation",
        duration: "28:15",
        description: "Interacting with HTML elements using JavaScript",
        completed: false,
        module: "JavaScript Fundamentals"
      }
    ]
  },
  {
    id: 2,
    title: "Backend Development with Node.js & Express",
    description: "Build robust server-side applications with Node.js, Express, and MongoDB.",
    level: "Intermediate",
    duration: "10 weeks",
    students: 2187,
    rating: 4.7,
    instructor: "Jane Smith",
    startDate: "May 1, 2025",
    category: "backend",
    tags: ["Node.js", "Express", "MongoDB", "REST API"],
    videos: [
      {
        id: 1,
        title: "Introduction to Node.js",
        duration: "20:15",
        description: "Getting started with Node.js runtime environment",
        completed: true,
        module: "Introduction to Node.js and Express"
      },
      {
        id: 2,
        title: "Setting up Express Server",
        duration: "18:45",
        description: "Creating your first Express.js server",
        completed: false,
        module: "Introduction to Node.js and Express"
      },
      {
        id: 3,
        title: "Building REST APIs",
        duration: "32:20",
        description: "Creating RESTful endpoints with Express",
        completed: false,
        module: "Building RESTful APIs"
      },
      {
        id: 4,
        title: "MongoDB Integration",
        duration: "26:30",
        description: "Connecting Node.js with MongoDB database",
        completed: false,
        module: "Connecting to MongoDB"
      }
    ]
  }
];

const CourseContentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { userId } = getUserInfo();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentModule, setCurrentModule] = useState("all");
  const [completedVideos, setCompletedVideos] = useState([]);

  // Fetch course from Firebase
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('Fetching course for content page:', courseId);
        const courseData = await getCourseById(courseId);
        console.log('Course data received:', courseData);
        console.log('Videos in course:', courseData.videos);
        setCourse(courseData);
        
        // Set first video as selected
        if (courseData.videos && courseData.videos.length > 0) {
          console.log('Setting first video as selected:', courseData.videos[0]);
          setSelectedVideo(courseData.videos[0]);
        } else {
          console.log('No videos found in course');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);
  
  const markVideoAsCompleted = (videoId) => {
    if (!completedVideos.includes(videoId)) {
      setCompletedVideos([...completedVideos, videoId]);
      // TODO: Save to Firebase
    }
  };

  // Helper function to determine video type
  const getVideoType = (url) => {
    if (!url) return 'none';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('vimeo.com')) return 'vimeo';
    return 'direct';
  };

  // Helper function to get YouTube embed URL
  const getYouTubeEmbedUrl = (url) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  // Helper function to get Vimeo embed URL
  const getVimeoEmbedUrl = (url) => {
    const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : null;
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <button 
            onClick={() => navigate('/courses')}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  // Get unique modules (if they exist)
  const modules = course.videos && course.videos.length > 0
    ? [...new Set(course.videos.map(video => video.module).filter(Boolean))]
    : [];
  
  // Filter videos by module
  const filteredVideos = currentModule === "all" 
    ? (course.videos || [])
    : (course.videos || []).filter(video => video.module === currentModule);

  const completedCount = completedVideos.length;
  const totalVideos = course.videos?.length || 0;
  const progressPercentage = totalVideos > 0 ? (completedCount / totalVideos) * 100 : 0;

  return (
    <div className="bg-gray-900 min-h-screen text-white mt-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-6">
        <div className="container mx-auto">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-300 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Course Details
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-2">
                {course.title}
              </h1>
              <div className="flex items-center space-x-6 text-gray-300">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-1 text-yellow-500" />
                  <span>{course.rating}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  <span>{course.videos.length} videos</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="text-right">
                <div className="text-sm text-gray-400">Course Progress</div>
                <div className="text-2xl font-bold text-green-500">{Math.round(progressPercentage)}%</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg">
              {selectedVideo ? (
                <>
                  {/* Video Player */}
                  <div className="aspect-video bg-gray-700 relative">
                    {selectedVideo.url ? (
                      <>
                        {(() => {
                          const videoType = getVideoType(selectedVideo.url);
                          
                          if (videoType === 'youtube') {
                            const embedUrl = getYouTubeEmbedUrl(selectedVideo.url);
                            return embedUrl ? (
                              <iframe
                                key={selectedVideo.id}
                                className="w-full h-full"
                                src={embedUrl}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <p className="text-red-400">Invalid YouTube URL</p>
                              </div>
                            );
                          }
                          
                          if (videoType === 'vimeo') {
                            const embedUrl = getVimeoEmbedUrl(selectedVideo.url);
                            return embedUrl ? (
                              <iframe
                                key={selectedVideo.id}
                                className="w-full h-full"
                                src={embedUrl}
                                title={selectedVideo.title}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <p className="text-red-400">Invalid Vimeo URL</p>
                              </div>
                            );
                          }
                          
                          // Direct video file
                          return (
                            <video 
                              key={selectedVideo.id}
                              className="w-full h-full"
                              controls
                              onEnded={() => markVideoAsCompleted(selectedVideo.id)}
                              onError={(e) => {
                                console.error('Video error:', e);
                                console.error('Video URL:', selectedVideo.url);
                              }}
                            >
                              <source src={selectedVideo.url} type="video/mp4" />
                              <source src={selectedVideo.url} type="video/webm" />
                              <source src={selectedVideo.url} type="video/ogg" />
                              Your browser does not support the video tag.
                            </video>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Play className="w-10 h-10 text-white ml-1" />
                          </div>
                          <p className="text-gray-300">Video not available</p>
                          <p className="text-sm text-gray-500 mt-1">No URL provided</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                    <p className="text-gray-400 mb-4">{selectedVideo.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-gray-300">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{selectedVideo.duration}</span>
                        </div>
                        <div className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          <span>{selectedVideo.module}</span>
                        </div>
                      </div>
                      
                      {completedVideos.includes(selectedVideo.id) && (
                        <div className="flex items-center text-green-500">
                          <CheckCircle className="w-5 h-5 mr-1" />
                          <span className="text-sm">Completed</span>
                        </div>
                      )}
                      
                      {!completedVideos.includes(selectedVideo.id) && (
                        <button
                          onClick={() => markVideoAsCompleted(selectedVideo.id)}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gray-700 flex items-center justify-center">
                  <p className="text-gray-400">Select a video to start learning</p>
                </div>
              )}
            </div>
          </div>

          {/* Course Content Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Course Content</h3>
              
              {/* Module Filter */}
              <div className="mb-6">
                <select 
                  value={currentModule}
                  onChange={(e) => setCurrentModule(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="all">All Modules</option>
                  {modules.map((module, index) => (
                    <option key={index} value={module}>{module}</option>
                  ))}
                </select>
              </div>

              {/* Video List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Debug Info */}
                <div className="text-xs text-gray-500 mb-2 p-2 bg-gray-900 rounded">
                  Debug: {totalVideos} videos total, {filteredVideos.length} filtered
                </div>
                
                {filteredVideos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p className="font-bold">No videos available yet.</p>
                    <p className="text-sm mt-2">The creator hasn't added any videos to this course.</p>
                    <p className="text-xs mt-4 text-gray-500">
                      Total videos in course: {totalVideos}
                    </p>
                  </div>
                ) : (
                  filteredVideos.map((video, index) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video)}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      selectedVideo?.id === video.id
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          video.completed 
                            ? 'bg-green-500' 
                            : selectedVideo?.id === video.id 
                              ? 'bg-white/20' 
                              : 'bg-gray-600'
                        }`}>
                          {video.completed ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white ml-0.5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white line-clamp-2">
                            {video.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">{video.duration}</p>
                        </div>
                      </div>
                      
                      {!video.completed && selectedVideo?.id !== video.id && (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                  ))
                )}
              </div>

              {/* Progress Summary */}
              {totalVideos > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">
                    {completedCount} of {totalVideos} videos completed
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseContentPage;