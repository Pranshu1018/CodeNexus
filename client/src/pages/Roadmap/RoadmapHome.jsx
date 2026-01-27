import { useEffect} from "react";
import { Link } from "react-router-dom";
import { FaLaptopCode, FaServer, FaMobileAlt, FaDatabase, FaCloud, FaShieldAlt, FaGithub } from 'react-icons/fa';

const roadmaps = [
  {
    id: 1,
    title: "Frontend Development",
    description: "Master the skills needed to become a frontend developer.",
    icon: <FaLaptopCode />,
  },
  {
    id: 2,
    title: "Backend Development",
    description: "Become proficient in building server-side applications.",
    icon: <FaServer />,
  },
  {
    id: 3,
    title: "Fullstack Development",
    description: "Learn both frontend and backend to become a fullstack developer.",
    icon: <FaLaptopCode />,
  },
  {
    id: 4,
    title: "Mobile App Development",
    description: "Learn how to create mobile applications for iOS and Android platforms.",
    icon: <FaMobileAlt />,
  },
  {
    id: 5,
    title: "Data Science",
    description: "Dive into data analysis, machine learning, and statistical models.",
    icon: <FaDatabase />,
  },
  {
    id: 6,
    title: "Machine Learning",
    description: "Become skilled in building machine learning models and solving AI problems.",
    icon: <FaDatabase />,
  },
  {
    id: 7,
    title: "Cloud Computing",
    description: "Learn how to manage and deploy applications in the cloud using AWS, Azure, or Google Cloud.",
    icon: <FaCloud />,
  },
  {
    id: 8,
    title: "DevOps",
    description: "Master the practices of continuous integration, continuous delivery, and infrastructure automation.",
    icon: <FaGithub />,
  },
  {
    id: 9,
    title: "Cybersecurity",
    description: "Learn how to protect applications and networks from cyber threats and attacks.",
    icon: <FaShieldAlt />,
  },
  {
    id: 10,
    title: "Blockchain Development",
    description: "Understand blockchain technology and learn how to build decentralized applications (dApps).",
    icon: <FaDatabase />,
  },
];

const RoadmapsHome = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white p-8 sm:p-10 lg:p-14 mt-20 ">
      <h1 className="text-5xl font-extrabold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500">
        Roadmaps for Development
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 ">
        {roadmaps.map((roadmap) => (
          <Link
            key={roadmap.id}
            to={`/Roadmaps/${roadmap.id}`}
            className="p-6 rounded-2xl shadow-xl transform transition-all hover:scale-105 hover:shadow-2xl hover:bg-gradient-to-r focus:outline-none focus:ring-4 focus:ring-blue-300 bg-gray-800"
            aria-label={`Go to ${roadmap.title} roadmap`}
            style={{
              background: `linear-gradient(to right, ${getGradient(roadmap.id)})`
            }}
          >
            <div className="flex justify-center items-center mb-4">
              <div className="text-4xl text-white">{roadmap.icon}</div>
            </div>
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 mb-3 text-center">
              {roadmap.title}
            </h2>
            <p className="text-gray-200 text-base text-center">{roadmap.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Function to return gradient colors based on roadmap id
const getGradient = (id) => {
  switch (id) {
    case 1:
      return 'from-purple-500 to-pink-500'; // Frontend Development
    case 2:
      return 'from-teal-500 to-cyan-500'; // Backend Development
    case 3:
      return 'from-purple-500 to-pink-500'; // Fullstack Development
    case 4:
      return 'from-indigo-500 to-purple-600'; // Mobile App Development
    case 5:
      return 'from-orange-500 to-yellow-600'; // Data Science
    case 6:
      return 'from-red-500 to-orange-600'; // Machine Learning
    case 7:
      return 'from-blue-500 to-teal-500'; // Cloud Computing
    case 8:
      return 'from-green-500 to-lime-500'; // DevOps
    case 9:
      return 'from-blue-500 to-purple-600'; // Cybersecurity
    case 10:
      return 'from-pink-500 to-indigo-500'; // Blockchain Development
    default:
      return 'from-gray-500 to-gray-700'; // Default gradient
  }
};

export default RoadmapsHome;
