import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate from react-router-dom
import Button from "../components/Button"; // Assuming Button is the same as before
import Pay from "../components/Pay";

const PaymentPage = () => {
  const { courseId } = useParams(); // Get the courseId from the URL
  const navigate = useNavigate(); // useNavigate hook to navigate programmatically

  // Example static courses array for demo purposes
  const courses = [
    {
      id: 1,
      title: "Complete Frontend Development Bootcamp",
      description: "Master HTML, CSS, JavaScript, and React with hands-on projects and exercises.",
    },
    {
      id: 2,
      title: "Backend Development with Node.js & Express",
      description: "Build robust server-side applications with Node.js, Express, and MongoDB.",
    },
  ];

  const course = courses.find((course) => course.id === parseInt(courseId));

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    courseName: course ? course.title : "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can integrate the payment gateway
    alert("Payment process started for course: " + formData.courseName);
    // After payment is successful, redirect to a success page or another page
    navigate("/payment-success"); // Use navigate to redirect
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-extrabold mb-6">Payment for {course ? course.title : "Course"}</h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-col">
              <label className="text-lg" htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="bg-gray-800 text-white p-4 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-gray-800 text-white p-4 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg" htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="bg-gray-800 text-white p-4 rounded-lg"
                required
              />
            </div>
            <div className="flex flex-col">
              <label className="text-lg" htmlFor="courseName">Course Name</label>
              <input
                type="text"
                id="courseName"
                name="courseName"
                value={formData.courseName}
                readOnly
                className="bg-gray-800 text-white p-4 rounded-lg"
              />
            </div>
          </div>

          <div className="text-center">
            <Pay />
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentPage;
