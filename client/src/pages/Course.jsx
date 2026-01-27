import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useSpring, animated } from "@react-spring/web";
import html2pdf from "html2pdf.js";

const Course = () => {
  const [courseData, setCourseData] = useState({
    title: "React for Beginners",
    description:
      "This is a comprehensive course to learn React step-by-step. Follow the timeline to go through each lesson and unlock your potential.",
    playlistId: "PLu71SKxNbfoDqgPchmvIsL4hTnJIrtige", // Replace with your YouTube playlist ID
    timeline: [
      {
        title: "Introduction to React",
        duration: "15 min",
        videoId: "vz1RlUyrc3w",
        detail: "Learn the basics of React, its key concepts, and how to set up your first React app.",
        completed: false,
      },
      {
        title: "JSX and Rendering Elements",
        duration: "20 min",
        videoId: "k3KqQvywToE",
        detail: "Understand JSX syntax and how React renders elements to the DOM.",
        completed: false,
      },
      {
        title: "State and Props",
        duration: "25 min",
        videoId: "yNbnA5pryMg",
        detail: "Learn about React state and props, how to manage data flow in your app.",
        completed: false,
      },
      {
        title: "Handling Events",
        duration: "30 min",
        videoId: "kAOuj6o7Kxs",
        detail: "Learn how to handle user inputs and events in React, and update the UI accordingly.",
        completed: false,
      },
      {
        title: "React Hooks",
        duration: "35 min",
        videoId: "lI7IIOWM0Mo",
        detail: "Master React hooks like useState and useEffect to build functional components.",
        completed: false,
      },
    ],
  });

  const calculateProgress = () => {
    const totalLessons = courseData.timeline.length;
    const completedLessons = courseData.timeline.filter((lesson) => lesson.completed).length;
    return (completedLessons / totalLessons) * 100;
  };

  const toggleCompletion = (index) => {
    const updatedTimeline = [...courseData.timeline];
    updatedTimeline[index].completed = !updatedTimeline[index].completed;
    setCourseData((prevState) => ({
      ...prevState,
      timeline: updatedTimeline,
    }));
  };

  const [showCelebration, setShowCelebration] = useState(false);
  
  useEffect(() => {
    if (calculateProgress() === 100) {
      setShowCelebration(true); // Trigger celebration when course is complete
    }
  }, [courseData]);

  const handleDownloadCertificate = () => {
    const certificateElement = document.getElementById("certificate");
    html2pdf()
      .from(certificateElement)
      .save("certificate.pdf");
  };

  const closeModal = () => {
    setShowCelebration(false); // Close the modal
  };

  // Sample recommended courses
  const recommendedCourses = [
    { title: "Advanced React", description: "Dive deeper into React concepts and build complex apps.", link: "/courses/advanced-react" },
    { title: "React with TypeScript", description: "Learn to build React apps with TypeScript for better type safety.", link: "/courses/react-with-typescript" },
    { title: "React Native for Beginners", description: "Build mobile apps using React Native from scratch.", link: "/courses/react-native-for-beginners" },
  ];

  return (
    <>
      <section className=" text-white py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-shadow-lg">
            {courseData.title}
          </h1>
          <p className="text-xl mb-8">{courseData.description}</p>
          <Link to="/courses">
            <button className="bg-white text-blue-700 px-6 py-3 rounded-full hover:bg-blue-500 hover:text-white transition-all transform duration-300 shadow-lg">
              <ArrowRight className="mr-2" />
              View All Courses
            </button>
          </Link>
        </div>
      </section>

      {/* YouTube Playlist Embed */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold mb-6">Watch Course Playlist</h2>
          <div className="relative w-full pb-56.25% mb-8">
            <iframe
              src={`https://www.youtube.com/embed/videoseries?list=${courseData.playlistId}`}
              className="absolute top-0 left-0 w-full h-full rounded-lg shadow-xl"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
          <p className="text-gray-300">Watch the videos in the playlist above.</p>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="py-6 bg-gray-800">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-semibold text-white mb-4">Course Progress</h3>
          <div className="relative w-full bg-gray-600 rounded-full h-4 mb-4">
            <div
              className="absolute top-0 left-0 bg-blue-500 h-4 rounded-full"
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
          <p className="text-white text-sm">{Math.round(calculateProgress())}% completed</p>
        </div>
      </section>

      {/* Course Timeline */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold mb-8 text-center text-white">Course Timeline</h2>
          <div className="relative">
            {courseData.timeline.map((item, index) => (
              <div
                key={index}
                className="flex items-center mb-12 relative"
                style={{ zIndex: index + 1 }}
              >
                {/* Circle and timeline line */}
                <div
                  className={`left-3/4 z-10 flex justify-center items-center w-12 h-12 rounded-full bg-blue-600 text-white absolute transform -translate-x-1/2 ${item.completed ? "bg-green-500" : ""}`}
                >
                  <PlayCircle className="w-6 h-6" />
                </div>
                {index < courseData.timeline.length - 1 && (
                  <div className="absolute top-0 left-3/4 transform -translate-x-1/2 w-1 bg-blue-600 h-60 z-0"></div>
                )}
                {/* Timeline Content */}
                <div className="flex-1 ml-32 relative group">
                  <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-300">{item.duration}</p>
                  <p className="text-gray-400 mt-2">{item.detail}</p>
                  <div className="mt-4">
                    <button
                      className="bg-green-500 text-white px-4 py-2 rounded-full"
                      onClick={() => toggleCompletion(index)}
                    >
                      {item.completed ? "Mark as Incomplete" : "Mark as Completed"}
                    </button>
                  </div>

                  {/* Preview on Hover */}
                  <div className="absolute left-9/10 transform -translate-x-1/2 top-1/2 -translate-y-1/2 bg-black text-white p-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                  <iframe
                        width="200"
                        height="120"
                        src={`https://www.youtube.com/embed/${item.videoId}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube Video"
                ></iframe>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebration Modal */}
      {showCelebration && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white text-center p-8 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold text-green-500 mb-4">Congratulations!</h2>
            <p className="text-lg text-gray-700 mb-6">
              You have successfully completed the course!
            </p>
            <button
              className="bg-green-500 text-white px-6 py-3 rounded-full"
              onClick={handleDownloadCertificate}
            >
              Download Certificate
            </button>
            <button
              className="bg-gray-300 text-gray-800 px-6 py-3 rounded-full mt-4 ml-4"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Download Certificate Button (Hidden until course completion) */}
      {calculateProgress() === 100 && (
        <div className="text-center mt-8">
          <button
            onClick={handleDownloadCertificate}
            className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all duration-300"
          >
            Download Your Certificate
          </button>
        </div>
      )}

      {/* Certificate Template (Hidden) */}
      <div id="certificate" style={{ display: "none" }}>
        <div className="certificate-container" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", border: "5px solid #333", borderRadius: "15px", textAlign: "center", backgroundColor: "#f4f4f4" }}>
          <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>Certificate of Completion</h1>
          <p style={{ fontSize: "1.5rem", marginBottom: "20px" }}>This is to certify that</p>
          <h2 style={{ fontSize: "2rem", marginBottom: "30px" }}><strong>John Doe</strong></h2>
          <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>has successfully completed the course</p>
          <h3 style={{ fontSize: "2rem", marginBottom: "20px" }}>React for Beginners</h3>
          <p style={{ fontSize: "1rem", marginBottom: "20px" }}>Date of Completion: {new Date().toLocaleDateString()}</p>
          <div className="signature" style={{ marginTop: "50px", fontSize: "1.2rem" }}>
            <p>Instructor's Signature</p>
          </div>
        </div>
      </div>

      {/* Recommended Courses Section */}
      <section className="py-16 bg-gray-900">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-white mb-8">Recommended Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
            {recommendedCourses.map((course, index) => (
              <div key={index} className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold mb-4">{course.title}</h4>
                <p className="text-gray-300 mb-6">{course.description}</p>
                <Link to={course.link} className="text-blue-500 font-semibold">
                  Start Learning <ArrowRight />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Course;
