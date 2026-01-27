import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import Button from "../components/Button";
import MatrixBackground from "../components/MatrixBackground";
import { db } from "../Firebase/firebase"; // Import firebase config
import { collection, getDocs } from "firebase/firestore";
import Course from ".//Course";
import { useNavigate } from "react-router-dom";

export default function EnrolledCoursesPage() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const navigateToCourse = (courseId) => {
    // Navigates to a different route, e.g., /home
    navigate('/Course');
  };

  // Fetch enrolled courses from Firestore
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "enrolledCourses"));
        const coursesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEnrolledCourses(coursesData);
      } catch (error) {
        console.error("Error fetching enrolled courses: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  return (
    <>
      <MatrixBackground opacity={0.03} />

      {/* Enrolled Courses Page Header */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-20 mt-22">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
              Enrolled Courses
            </h1>
            <p className="text-xl mb-8">
              Continue learning and growing with your enrolled courses.
            </p>

            <div className="text-white mb-8">
              <Link to="/courses">
                <Button variant="neon" size="sm" className="hover:scale-105 transition-transform duration-300">
                    <ArrowLeft className="mr-2" /> View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enrolled Courses List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center items-center">
              
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              
              {enrolledCourses.length > 0 ? (
                enrolledCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-gray-900/80 rounded-lg overflow-hidden border border-gray-800 transform hover:scale-105 transition-all duration-300 shadow-lg"
                    onClick={navigateToCourse}
                  >
                    <div className="p-6">
                      <h3 className="text-2xl font-bold mb-3 text-white">{course.title}</h3>
                      <p className="text-gray-300 text-sm mb-4">{course.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <Users className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-gray-400 text-sm">{course.students} students</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-500 text-lg">{course.rating} ⭐</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 mt-8">
                  <p>You have not enrolled in any courses yet. Check out the available courses!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
