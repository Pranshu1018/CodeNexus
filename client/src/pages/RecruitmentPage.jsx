import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Briefcase, Search, MapPin, Building, Clock, Filter, ChevronDown, Star, Bookmark, BookmarkCheck } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import MockInterButton from '../components/MockInterButton';

const RecruitmentPage = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const navigate = useNavigate();

  // Sample job data
  const jobs = [
    {
      id: 1,
      title: "Senior Full Stack Developer",
      company: "TechNova",
      location: "San Francisco, CA (Remote)",
      type: "Full-time",
      salary: "$120K - $150K",
      posted: "2 days ago",
      skills: ["React", "Node.js", "MongoDB", "AWS"],
      description: "We're looking for an experienced Full Stack Developer to join our growing team. You'll be working on our core product, building new features and improving existing ones."
    },
    {
      id: 2,
      title: "Frontend Engineer",
      company: "PixelPerfect",
      location: "New York, NY (Hybrid)",
      type: "Full-time",
      salary: "$90K - $120K",
      posted: "1 week ago",
      skills: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      description: "Join our team to build beautiful, responsive user interfaces for our clients. You'll be working closely with designers and backend engineers."
    },
    {
      id: 3,
      title: "Backend Developer",
      company: "DataFlow",
      location: "Remote",
      type: "Contract",
      salary: "$70 - $90 / hour",
      posted: "3 days ago",
      skills: ["Python", "Django", "PostgreSQL", "Docker"],
      description: "We need a backend developer to help us scale our data processing pipeline. Experience with high-volume data processing is a plus."
    },
    {
      id: 4,
      title: "DevOps Engineer",
      company: "CloudNine",
      location: "Seattle, WA (On-site)",
      type: "Full-time",
      salary: "$130K - $160K",
      posted: "Just now",
      skills: ["Kubernetes", "AWS", "Terraform", "CI/CD"],
      description: "Help us build and maintain our cloud infrastructure. You'll be responsible for deployment pipelines, monitoring, and security."
    },
    {
      id: 5,
      title: "Mobile Developer (React Native)",
      company: "AppWorks",
      location: "Austin, TX (Remote)",
      type: "Full-time",
      salary: "$100K - $130K",
      posted: "1 day ago",
      skills: ["React Native", "JavaScript", "Redux", "Firebase"],
      description: "Join our mobile team to build cross-platform applications. You'll be working on new features and improving the user experience."
    }
  ];

  useEffect(() => {
    // Animate page elements
    gsap.fromTo(
      '.recruitment-header > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.search-bar',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.job-tabs',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.job-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const toggleSaveJob = (jobId) => {
    if (savedJobs.includes(jobId)) {
      setSavedJobs(savedJobs.filter(id => id !== jobId));
    } else {
      setSavedJobs([...savedJobs, jobId]);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <MockInterButton />
      <div className="container mx-auto px-4">
        <div className="recruitment-header text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your <span className="gradient-text">Dream Job</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Connect with top tech companies looking for talented developers. Browse job listings, submit your profile, and get hired.
          </p>
        </div>

        <div className="search-bar max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for jobs, companies, or skills..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 pl-12 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200"
              onClick={() => setFilterOpen(!filterOpen)}
            >
              <Filter size={20} />
            </button>
          </div>

          {filterOpen && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Job Type</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Location</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Locations</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Experience Level</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="job-tabs flex border-b border-gray-700 mb-8">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'jobs'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              All Jobs
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'saved'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Saved Jobs
            </button>
            <button
              onClick={() => setActiveTab('applied')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'applied'
                  ? 'text-green-500 border-b-2 border-green-500'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Applied Jobs
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === 'jobs' && filteredJobs.length > 0 ? (
              filteredJobs.map(job => (
                <div key={job.id} className="job-card bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                      <div className="flex items-center text-gray-400 mb-4">
                        <Building size={16} className="mr-1" />
                        <span className="mr-4">{job.company}</span>
                        <MapPin size={16} className="mr-1" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggleSaveJob(job.id)}
                      className="text-gray-400 hover:text-green-500 transition-colors"
                    >
                      {savedJobs.includes(job.id) ? (
                        <BookmarkCheck size={20} className="text-green-500" />
                      ) : (
                        <Bookmark size={20} />
                      )}
                    </button>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{job.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.skills.map(skill => (
                      <span key={skill} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <span className="text-green-500 font-medium">{job.salary}</span>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock size={14} className="mr-1" />
                        {job.posted}
                      </span>
                      <span className="text-gray-400 text-sm">{job.type}</span>
                    </div>
                    <button className="btn-primary text-sm py-2">Apply Now</button>
                  </div>
                </div>
              ))
            ) : activeTab === 'jobs' && filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            ) : activeTab === 'saved' ? (
              savedJobs.length > 0 ? (
                jobs
                  .filter(job => savedJobs.includes(job.id))
                  .map(job => (
                    <div key={job.id} className="job-card bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                          <div className="flex items-center text-gray-400 mb-4">
                            <Building size={16} className="mr-1" />
                            <span className="mr-4">{job.company}</span>
                            <MapPin size={16} className="mr-1" />
                            <span>{job.location}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleSaveJob(job.id)}
                          className="text-gray-400 hover:text-green-500 transition-colors"
                        >
                          <BookmarkCheck size={20} className="text-green-500" />
                        </button>
                      </div>
                      
                      <p className="text-gray-300 mb-4">{job.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {job.skills.map(skill => (
                          <span key={skill} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          <span className="text-green-500 font-medium">{job.salary}</span>
                          <span className="text-gray-400 text-sm flex items-center">
                            <Clock size={14} className="mr-1" />
                            {job.posted}
                          </span>
                          <span className="text-gray-400 text-sm">{job.type}</span>
                        </div>
                        <button className="btn-primary text-sm py-2">Apply Now</button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                    <Bookmark className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No saved jobs</h3>
                  <p className="text-gray-400">
                    Save jobs you're interested in to view them later.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No applied jobs</h3>
                <p className="text-gray-400">
                  You haven't applied to any jobs yet. Start applying to track your applications.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Upload Your Resume</h3>
              <p className="text-gray-400 mb-6">
                Upload your resume to make it easier to apply for jobs and get discovered by recruiters.
              </p>
              <button className="btn-secondary">Upload Resume</button>
              <button
      className="btn-secondary ml-3"
      onClick={() => navigate("/resume")}
    >
      Build Resume
    </button>
            </div>
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Create Your Profile</h3>
              <p className="text-gray-400 mb-6">
                Complete your developer profile to showcase your skills and experience to potential employers.
              </p>
              <button className="btn-primary">Complete Profile</button>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Top Companies Hiring Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['TechNova', 'PixelPerfect', 'DataFlow', 'CloudNine'].map((company, index) => (
              <div key={index} className="bg-gray-800 rounded-lg p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300">
                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">{company.charAt(0)}</span>
                </div>
                <h3 className="font-bold mb-1">{company}</h3>
                <p className="text-gray-400 text-sm">Multiple openings</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruitmentPage;
