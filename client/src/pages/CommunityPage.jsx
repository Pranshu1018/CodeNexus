import { useEffect, useState, useRef } from 'react';
import { gsap } from 'gsap';
import { MessageSquare, Users, Search, ThumbsUp, MessageCircle, Share2, Bookmark, Filter, Tag, Clock } from 'lucide-react';

const CommunityPage = () => {
  const [activeTab, setActiveTab] = useState('discussions');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const discussionsRef = useRef(null);

  // Sample discussion data
  const discussions = [
    {
      id: 1,
      title: "Best practices for React state management in 2023",
      author: "Alex Johnson",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "2 days ago",
      content: "I've been using Redux for a while, but I'm curious about other state management solutions like Zustand, Jotai, and React Query. What are you all using in your projects?",
      likes: 42,
      comments: 18,
      tags: ["React", "State Management", "Frontend"],
      isBookmarked: false
    },
    {
      id: 2,
      title: "Debugging memory leaks in Node.js applications",
      author: "Samantha Lee",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 week ago",
      content: "I'm experiencing memory leaks in my Node.js application. I've tried using the heap snapshot in Chrome DevTools, but I'm having trouble identifying the source. Has anyone dealt with this before? Any tools or techniques you'd recommend?",
      likes: 35,
      comments: 24,
      tags: ["Node.js", "Debugging", "Backend"],
      isBookmarked: true
    },
    {
      id: 3,
      title: "Transitioning from REST to GraphQL - worth it?",
      author: "Michael Chen",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "3 days ago",
      content: "My team is considering moving from REST APIs to GraphQL. For those who have made the switch, was it worth the effort? What were the biggest challenges and benefits?",
      likes: 28,
      comments: 31,
      tags: ["GraphQL", "REST", "API"],
      isBookmarked: false
    },
    {
      id: 4,
      title: "Optimizing Docker containers for production",
      author: "David Kim",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "5 days ago",
      content: "I'm looking for strategies to optimize our Docker containers for production. Currently, our images are quite large and startup times are slow. Any tips for making them more efficient?",
      likes: 19,
      comments: 12,
      tags: ["Docker", "DevOps", "Performance"],
      isBookmarked: false
    }
  ];

  // Sample questions data
  const questions = [
    {
      id: 1,
      title: "How to implement authentication with JWT in Next.js?",
      author: "Emma Wilson",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "1 day ago",
      content: "I'm building a Next.js application and need to implement authentication using JWT. What's the best approach? Should I use a library or build it from scratch?",
      likes: 15,
      comments: 8,
      tags: ["Next.js", "Authentication", "JWT"],
      isBookmarked: false
    },
    {
      id: 2,
      title: "Handling form validation in React - Formik vs React Hook Form",
      author: "James Rodriguez",
      authorAvatar: "/placeholder.svg?height=40&width=40",
      date: "4 days ago",
      content: "I'm trying to decide between Formik and React Hook Form for form validation in my React project. Which one do you prefer and why?",
      likes: 22,
      comments: 16,
      tags: ["React", "Forms", "Validation"],
      isBookmarked: true
    }
  ];

  useEffect(() => {
    // Animate page elements
    gsap.fromTo(
      '.community-header > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.search-bar',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.3, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.community-tabs',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, delay: 0.4, ease: 'power2.out' }
    );

    gsap.fromTo(
      '.post-card',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, delay: 0.5, ease: 'power2.out' }
    );

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    // Animate cards when changing tabs
    if (discussionsRef.current) {
      gsap.fromTo(
        '.post-card',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, [activeTab]);

  const toggleBookmark = (id) => {
    // In a real app, this would update state or make an API call
    console.log(`Toggled bookmark for post ${id}`);
  };

  const handleLike = (id) => {
    // In a real app, this would update state or make an API call
    console.log(`Liked post ${id}`);
  };

  const filteredPosts = activeTab === 'discussions' 
    ? discussions.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : questions.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="container mx-auto px-4">
        <div className="community-header text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Community <span className="gradient-text">Discussions</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Join our vibrant community of developers to share knowledge, ask questions, and collaborate on projects.
          </p>
        </div>

        <div className="search-bar max-w-4xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search discussions, questions, or tags..."
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
                <label className="block text-sm font-medium text-gray-400 mb-2">Sort By</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="recent">Most Recent</option>
                  <option value="popular">Most Popular</option>
                  <option value="comments">Most Comments</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">All Tags</option>
                  <option value="react">React</option>
                  <option value="node">Node.js</option>
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Time Period</label>
                <select className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="all">All Time</option>
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="community-tabs flex border-b border-gray-700">
              <button
                onClick={() => setActiveTab('discussions')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'discussions'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Discussions
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'questions'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Questions
              </button>
              <button
                onClick={() => setActiveTab('bookmarked')}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === 'bookmarked'
                    ? 'text-green-500 border-b-2 border-green-500'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Bookmarked
              </button>
            </div>
            <button className="btn-primary text-sm py-2">
              {activeTab === 'discussions' ? 'New Discussion' : 'Ask Question'}
            </button>
          </div>

          <div ref={discussionsRef} className="space-y-6">
            {filteredPosts.length > 0 ? (
              filteredPosts.map(post => (
                <div key={post.id} className="post-card bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-green-500 transition-all duration-300">
                  <div className="flex items-start mb-4">
                    <img src={post.authorAvatar || "/placeholder.svg"} alt={post.author} className="w-10 h-10 rounded-full mr-4" />
                    <div>
                      <h3 className="text-xl font-bold mb-1">{post.title}</h3>
                      <div className="flex items-center text-gray-400 text-sm">
                        <span className="mr-2">{post.author}</span>
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {post.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{post.content}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-md text-xs flex items-center">
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-4">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center text-gray-400 hover:text-green-500 transition-colors"
                      >
                        <ThumbsUp size={18} className="mr-1" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center text-gray-400 hover:text-blue-500 transition-colors">
                        <MessageCircle size={18} className="mr-1" />
                        <span>{post.comments}</span>
                      </button>
                      <button className="flex items-center text-gray-400 hover:text-purple-500 transition-colors">
                        <Share2 size={18} />
                      </button>
                    </div>
                    <button 
                      onClick={() => toggleBookmark(post.id)}
                      className={`text-gray-400 ${post.isBookmarked ? 'text-yellow-500' : 'hover:text-yellow-500'} transition-colors`}
                    >
                      <Bookmark size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="inline-block p-4 rounded-full bg-gray-800 mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No results found</h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Community Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="text-green-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Be Respectful</h3>
              <p className="text-gray-400">
                Treat others with respect. No personal attacks, harassment, or discriminatory language.
              </p>
            </div>
            <div className="card">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="text-blue-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Be Helpful</h3>
              <p className="text-gray-400">
                Share your knowledge and expertise. Provide constructive feedback and solutions when possible.
              </p>
            </div>
            <div className="card">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                <MessageCircle className="text-purple-500" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Stay On Topic</h3>
              <p className="text-gray-400">
                Keep discussions relevant to programming, development, and related topics.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold mb-4">Join Our Discord Community</h2>
              <p className="text-gray-300 mb-6">
                Connect with fellow developers in real-time. Get instant help, share resources, and participate in community events.
              </p>
              <button className="btn-primary">Join Discord</button>
            </div>
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-700">
              <h3 className="text-xl font-bold mb-4">Community Benefits:</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">Real-time chat with developers</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">Dedicated help channels</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">Code review sessions</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">Weekly community events</span>
                </li>
                <li className="flex items-start">
                  <div className="mr-2 mt-1 w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                    <span className="text-green-500 text-xs">✓</span>
                  </div>
                  <span className="text-gray-300">Networking opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;