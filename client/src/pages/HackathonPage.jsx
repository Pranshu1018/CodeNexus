import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Zap,
  Calendar,
  Users,
  Clock,
  Trophy,
  MapPin,
  ChevronRight,
  Filter,
  Tag
} from 'lucide-react';
import img1 from '../assets/Hackathons/img1.jpeg';
import img2 from '../assets/Hackathons/img2.jpeg';
import img3 from '../assets/Hackathons/img3.jpeg';

const HackathonPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [filterOpen, setFilterOpen] = useState(false);
  const [hostFormOpen, setHostFormOpen] = useState(false);

  // Sample hackathon data
  const hackathons = {
    upcoming: [
      {
        id: 1,
        title: "AI Innovation Challenge",
        organizer: "TechNova",
        date: "June 15-17, 2023",
        location: "Virtual",
        participants: 500,
        prize: "$10,000",
        image: img1,
        tags: ["AI", "Machine Learning", "Data Science"],
        description:
          "Build innovative AI solutions to solve real-world problems. This hackathon focuses on creating practical applications using machine learning and data science."
      },
      {
        id: 2,
        title: "Web3 Hackathon",
        organizer: "Blockchain Alliance",
        date: "July 8-10, 2023",
        location: "San Francisco, CA",
        participants: 300,
        prize: "$15,000",
        image: img2,
        tags: ["Blockchain", "Smart Contracts", "DeFi"],
        description:
          "Develop decentralized applications on blockchain technology. This hackathon is perfect for developers interested in Web3, DeFi, and smart contracts."
      },
      {
        id: 3,
        title: "Mobile App Challenge",
        organizer: "AppWorks",
        date: "August 5-7, 2023",
        location: "Virtual",
        participants: 400,
        prize: "$8,000",
        image: img3,
        tags: ["Mobile", "React Native", "Flutter"],
        description:
          "Create innovative mobile applications that solve everyday problems. This hackathon is open to all mobile development frameworks."
      }
    ],
    ongoing: [
      {
        id: 4,
        title: "Cloud Computing Challenge",
        organizer: "CloudNine",
        date: "May 20-27, 2023",
        location: "Virtual",
        participants: 350,
        prize: "$12,000",
        image: "/placeholder.svg?height=200&width=400",
        tags: ["Cloud", "AWS", "Serverless"],
        description:
          "Build scalable cloud solutions using modern cloud computing technologies. This week-long hackathon focuses on serverless architecture and cloud optimization."
      }
    ],
    past: [
      {
        id: 5,
        title: "Open Source Contribution",
        organizer: "GitHub",
        date: "April 10-12, 2023",
        location: "Virtual",
        participants: 600,
        prize: "$20,000",
        image: "/placeholder.svg?height=200&width=400",
        tags: ["Open Source", "Collaboration", "Community"],
        description:
          "Contribute to open source projects and help build the future of software. This hackathon focused on meaningful contributions to popular open source repositories."
      },
      {
        id: 6,
        title: "Game Development Jam",
        organizer: "GameCraft",
        date: "March 15-17, 2023",
        location: "Austin, TX",
        participants: 250,
        prize: "$7,500",
        image: "/placeholder.svg?height=200&width=400",
        tags: ["Games", "Unity", "Unreal Engine"],
        description:
          "Create exciting games in just 48 hours. This game jam brought together developers, artists, and designers to build innovative gaming experiences."
      }
    ]
  };

  useEffect(() => {
    // Animate header, tabs and hackathon cards
    gsap.registerPlugin(ScrollTrigger);
    gsap.fromTo(
      '.hackathon-header > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.hackathon-tabs',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.hackathon-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Animate cards when changing tabs
    gsap.fromTo(
      '.hackathon-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
  }, [activeTab]);

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="hackathon-header text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="gradient-text">Hackathons</span> & Coding Competitions
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Participate in exciting hackathons to solve real-world problems, showcase your skills, and win prizes.
          </p>
        </div>

        {/* Tabs and Filter */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="hackathon-tabs flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'upcoming'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'ongoing'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'past'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Past Events
              </button>
            </div>
            <button
              className="flex items-center space-x-2 text-gray-400 hover:text-gray-200"
              onClick={() => {}}
            >
              <Filter size={18} />
              <span className="text-sm">Filter</span>
            </button>
          </div>

          {/* Filter Form (if open) */}
          {/* ... (you can add your filter form here if needed) ... */}

          {/* Hackathon Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hackathons[activeTab].map((hackathon) => (
              <div
                key={hackathon.id}
                className="hackathon-card bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-green-500 transition-all duration-300 flex flex-col"
              >
                <div className="relative">
                  <img
                    src={hackathon.image || "/placeholder.svg"}
                    alt={hackathon.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-gray-900 opacity-70"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="flex flex-wrap gap-2">
                      {hackathon.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-900/80 backdrop-blur-sm text-gray-300 px-2 py-1 rounded-md text-xs flex items-center"
                        >
                          <Tag size={12} className="mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h3 className="text-xl font-bold mb-2">{hackathon.title}</h3>
                  <p className="text-gray-400 text-sm mb-4">Organized by {hackathon.organizer}</p>
                  <p className="text-gray-300 mb-4">{hackathon.description}</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center text-gray-400 text-sm">
                      <Calendar size={16} className="mr-2 text-green-500" />
                      <span>{hackathon.date}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <MapPin size={16} className="mr-2 text-blue-500" />
                      <span>{hackathon.location}</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Users size={16} className="mr-2 text-purple-500" />
                      <span>{hackathon.participants} participants</span>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Trophy size={16} className="mr-2 text-yellow-500" />
                      <span>{hackathon.prize}</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button className={`w-full py-2 px-4 rounded-md flex items-center justify-center ${
                    activeTab === 'past'
                      ? 'bg-gray-700 text-gray-300'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  } transition-colors`}>
                    <span>{activeTab === 'past' ? 'View Results' : 'Register Now'}</span>
                    <ChevronRight size={16} className="ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hackathons[activeTab].length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No {activeTab} hackathons</h3>
              <p className="text-gray-400">
                {activeTab === 'upcoming'
                  ? 'Check back soon for new hackathons!'
                  : activeTab === 'ongoing'
                    ? 'There are no ongoing hackathons at the moment.'
                    : 'No past hackathons to display.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Host Hackathon Form Modal */}
      {hostFormOpen && <HostHackathonForm onClose={() => setHostFormOpen(false)} />}

      {/* Why Participate Section */}
      <div className="mt-16 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8">Why Participate in Hackathons?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-green-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Build Your Portfolio</h3>
            <p className="text-gray-400">
              Create real projects that showcase your skills and add them to your portfolio to impress potential employers.
            </p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Network with Peers</h3>
            <p className="text-gray-400">
              Connect with like-minded developers, designers, and entrepreneurs. Build relationships that can lead to future opportunities.
            </p>
          </div>
          <div className="card">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Trophy className="text-purple-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Win Prizes</h3>
            <p className="text-gray-400">
              Compete for cash prizes, job opportunities, mentorship, and other rewards that can help advance your career.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 max-w-6xl mx-auto bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Host Your Own Hackathon</h2>
            <p className="text-gray-300 mb-6">
              Looking to organize a hackathon for your company, school, or community? We can help you set up and manage your event from start to finish.
            </p>
            <button className="btn-primary" onClick={() => setHostFormOpen(true)}>
              Get Started
            </button>
          </div>
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-bold mb-4">Our Services Include:</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">Event planning and management</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">Participant registration and team formation</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">Judging and evaluation platform</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">Mentorship and technical support</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                  <span className="text-green-500 text-xs">✓</span>
                </div>
                <span className="text-gray-300">Prize distribution and follow-up</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {hostFormOpen && <HostHackathonForm onClose={() => setHostFormOpen(false)} />}
    </div>
  );
};

function HostHackathonForm({ onClose }) {
  const [formData, setFormData] = useState({
    eventName: '',
    organizer: '',
    date: '',
    location: '',
    prize: '',
    description: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Host Hackathon Form Data:", formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg relative max-w-xl w-full">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-300 text-3xl">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-4">Host Your Hackathon</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-1">Event Name</label>
            <input
              type="text"
              name="eventName"
              value={formData.eventName}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Organizer</label>
            <input
              type="text"
              name="organizer"
              value={formData.organizer}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Date</label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., June 20-22, 2023"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Prize Pool</label>
            <input
              type="text"
              name="prize"
              value={formData.prize}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="e.g., $5,000"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="4"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 rounded bg-green-600 hover:bg-green-500 text-white transition-colors"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default HackathonPage;
