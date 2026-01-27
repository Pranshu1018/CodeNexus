import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Button from "../components/Button";
import { ArrowRight, Clock, Star, Users, BookOpen, User, CreditCard, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "../components/SubscriptionModal";
import { getCourseById } from '../services/courseService';

// Static course data for the sake of this example.
const courses = [
  {
    id: 1,
    title: "Complete Frontend Development Bootcamp",
    description:
      "Master HTML, CSS, JavaScript, and React with hands-on projects and exercises.",
    level: "Beginner to Intermediate",
    duration: "12 weeks",
    students: 3245,
    rating: 4.8,
    image: "/placeholder.svg?height=400&width=600",
    instructor: "John Doe",
    startDate: "April 15, 2025",
    syllabus: [
      "HTML & CSS Basics",
      "Responsive Web Design",
      "JavaScript Fundamentals",
      "React Introduction",
      "State Management with Redux",
      "Project: Build a Portfolio Website",
    ],
    category: "frontend",
    tags: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    id: 2,
    title: "Backend Development with Node.js & Express",
    description:
      "Build robust server-side applications with Node.js, Express, and MongoDB.",
    level: "Intermediate",
    duration: "10 weeks",
    students: 2187,
    rating: 4.7,
    image: "/placeholder.svg?height=400&width=600",
    instructor: "Jane Smith",
    startDate: "May 1, 2025",
    syllabus: [
      "Introduction to Node.js and Express",
      "Building RESTful APIs",
      "Connecting to MongoDB",
      "Authentication and Security",
      "Project: Build a Blog API",
    ],
    category: "backend",
    tags: ["Node.js", "Express", "MongoDB", "REST API"],
  },
  // Other courses...
];

const CourseDetailsPage = () => {
  const { courseId } = useParams(); // Get the courseId from the URL
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch course from Firebase
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('Fetching course:', courseId);
        const courseData = await getCourseById(courseId);
        console.log('Course data:', courseData);
        setCourse(courseData);
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

  const Coursepay = () => {
    navigate(`/CoursePayment/${courseId}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-gray-900 min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course not found</h2>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const coursePrice = course.price || 0;

  return (
    <div className="bg-gray-900 min-h-screen text-white mt-15">
      <div className="container mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column (Image, Title, Description, and Additional Details) */}
        <div className="space-y-8">
          <div className="relative h-72 mb-8 bg-gradient-to-br from-purple-900 to-indigo-900">
            <img
              src={course.thumbnail || course.image || "https://via.placeholder.com/600x400?text=Course+Image"}
              alt={course.title}
              className="object-cover w-full h-full rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/600x400?text=Course+Image";
              }}
            />
          </div>

          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 mb-6">
            {course.title}
          </h1>
          <p className="text-lg text-gray-300">{course.description}</p>

          {/* Additional Details */}
          <div className="space-y-4 mt-8">
            {course.startDate && (
              <div className="flex items-center text-lg text-gray-200">
                <Clock className="h-5 w-5 text-gray-200 mr-2" />
                <span>Start Date: {course.startDate}</span>
              </div>
            )}
            {course.instructor && (
              <div className="flex items-center text-lg text-gray-200">
                <User className="h-5 w-5 text-gray-200 mr-2" />
                <span>Instructor: {course.instructor}</span>
              </div>
            )}
            {course.creatorName && (
              <div className="flex items-center text-lg text-gray-200">
                <User className="h-5 w-5 text-gray-200 mr-2" />
                <span>Creator: {course.creatorName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Detailed Information) */}
        <div className="space-y-8">
          {/* Course Overview */}
          <section className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-lg shadow-lg">
            <h2 className="text-3xl font-semibold text-white mb-6">Course Overview</h2>
            <div className="text-lg text-gray-200 space-y-2">
              {course.level && <div>Level: <span className="font-medium">{course.level}</span></div>}
              {course.duration && <div>Duration: <span className="font-medium">{course.duration}</span></div>}
              {course.category && <div>Category: <span className="font-medium capitalize">{course.category}</span></div>}
              {course.videos && <div>Videos: <span className="font-medium">{course.videos.length} lessons</span></div>}
              {course.students && <div>Students Enrolled: <span className="font-medium">{course.students.toLocaleString()}</span></div>}
            </div>

            <div className="flex justify-between items-center mt-6">
              {course.rating && (
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-500 mr-1" />
                  <span className="text-white">{course.rating}</span>
                </div>
              )}

              {course.students && (
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-200 mr-1" />
                  <span className="text-white">{course.students.toLocaleString()} students</span>
                </div>
              )}
            </div>
          </section>

          {/* Course Videos/Content */}
          {course.videos && course.videos.length > 0 && (
            <section className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-white mb-6">Course Content</h2>
              <div className="space-y-4 text-gray-200">
                {course.videos.slice(0, 5).map((video, index) => (
                  <div key={index} className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-200 mr-2" />
                    <span>{video.title}</span>
                  </div>
                ))}
                {course.videos.length > 5 && (
                  <div className="text-sm text-gray-300 mt-2">
                    + {course.videos.length - 5} more videos
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Course Syllabus - if exists */}
          {course.syllabus && course.syllabus.length > 0 && (
            <section className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-white mb-6">Course Syllabus</h2>
              <div className="space-y-4 text-gray-200">
                {course.syllabus.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <BookOpen className="h-5 w-5 text-gray-200 mr-2" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Course Tags */}
          {course.tags && course.tags.length > 0 && (
            <section className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-lg shadow-lg">
              <h2 className="text-3xl font-semibold text-white mb-6">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-800 text-gray-300 px-4 py-2 rounded-full text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Enroll CTA */}
          <section className="text-center mt-8 space-y-4">
            {/* View Course Content Button */}
            {course.videos && course.videos.length > 0 && (
              <button 
                onClick={() => navigate(`/course-content/${courseId}`)}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30 flex items-center justify-center gap-2 text-lg"
              >
                <BookOpen className="w-6 h-6" />
                Start Learning - {course.videos.length} Videos
              </button>
            )}
            
            {coursePrice > 0 && (
              <>
                <p className="text-gray-400 text-sm">Or subscribe for premium features</p>
                <button 
                  onClick={() => setIsSubscriptionModalOpen(true)}
                  className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 flex items-center justify-center gap-2 text-lg"
                >
                  <CreditCard className="w-6 h-6" />
                  Subscribe - ₹{coursePrice}
                </button>
                <p className="text-gray-400 text-sm">Or</p>
                <Button variant="neon" size="lg" className="rounded-full pl-3 pr-3 bg-gradient-to-r from-pink-500 to-purple-500" onClick={Coursepay}>
                  Enroll Now <ArrowRight className="inline ml-2" />
                </Button>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Course Subscription Modal */}
      <SubscriptionModal 
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        type="course"
        courseName={course?.title}
        coursePrice={coursePrice}
        courseId={courseId}
      />
    </div>
  );
};

export default CourseDetailsPage;
