import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { Zap, Calendar, Users, Clock, Trophy, MapPin, ChevronRight, Filter, Tag } from 'lucide-react';

const Leaderboard = () => {
  const [selectedTab, setSelectedTab] = useState('codeforces');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Sample data for leaderboards
  const leaderboards = {
    codeforces: [
      { rank: 1, username: 'Coder123', points: 3500 },
      { rank: 2, username: 'DevMaster', points: 3200 },
      { rank: 3, username: 'AlgoKing', points: 3000 },
      { rank: 4, username: 'CodeGeek', points: 2800 },
      { rank: 5, username: 'Techie1', points: 2700 },
      { rank: 6, username: 'CodingWizard', points: 2600 },
      { rank: 7, username: 'ProgrammerX', points: 2400 },
      { rank: 8, username: 'DevPro', points: 2300 },
    ],
    leetcode: [
      { rank: 1, username: 'LeetCodePro', points: 5000 },
      { rank: 2, username: 'Techie', points: 4500 },
      { rank: 3, username: 'ProblemSolver', points: 4000 },
      { rank: 4, username: 'DailyGrind', points: 3500 },
      { rank: 5, username: 'AlgoGuru', points: 3400 },
      { rank: 6, username: 'CodeMaster', points: 3300 },
      { rank: 7, username: 'HackerDev', points: 3000 },
      { rank: 8, username: 'AlgorithmMaster', points: 2900 },
    ],
    dailyChallenges: [
      { rank: 1, username: 'ChallengeKing', points: 150 },
      { rank: 2, username: 'DailyGrind', points: 120 },
      { rank: 3, username: 'DevHacker', points: 100 },
      { rank: 4, username: 'CodeWarrior', points: 90 },
      { rank: 5, username: 'TechMaster', points: 80 },
      { rank: 6, username: 'AlgorithmHero', points: 75 },
      { rank: 7, username: 'DailyCoder', points: 70 },
      { rank: 8, username: 'ChallengeMaster', points: 60 },
    ],
    hackathonWins: [
      { rank: 1, username: 'HackathonChampion', wins: 5 },
      { rank: 2, username: 'CodeWarrior', wins: 4 },
      { rank: 3, username: 'InnovationGuru', wins: 3 },
      { rank: 4, username: 'DevMaster', wins: 3 },
      { rank: 5, username: 'TechieKing', wins: 2 },
      { rank: 6, username: 'ChallengeKing', wins: 2 },
      { rank: 7, username: 'ProgrammerX', wins: 1 },
      { rank: 8, username: 'HackGuru', wins: 1 },
    ],
  };

  // Filter and sort data
  const filteredData = leaderboards[selectedTab].filter((entry) =>
    entry.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedData = filteredData.sort((a, b) => {
    const aVal = a.points !== undefined ? a.points : a.wins;
    const bVal = b.points !== undefined ? b.points : b.wins;
    if (sortOrder === 'asc') return aVal - bVal;
    return bVal - aVal;
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    gsap.fromTo(
      '.leaderboard-header > *',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
    gsap.fromTo(
      '.leaderboard-table',
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }
    );
  }, [selectedTab, searchQuery, sortOrder, currentPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 py-8 px-4">
      <div className="max-w-7xl mx-auto mt-5 pt-7">
        {/* Tab Navigation */}
        <div className="flex justify-center space-x-6 mb-8">
          {['codeforces', 'leetcode', 'dailyChallenges', 'hackathonWins'].map((tab) => (
            <button
              key={tab}
              onClick={() => { setSelectedTab(tab); setCurrentPage(1); }}
              className={`px-6 py-2 text-lg font-semibold rounded-full transition-all duration-300 ${
                selectedTab === tab
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'bg-gray-800 text-gray-300 hover:text-white hover:scale-105'
              }`}
            >
              {tab === 'codeforces' && 'Codeforces'}
              {tab === 'leetcode' && 'Leetcode'}
              {tab === 'dailyChallenges' && 'Daily Challenges'}
              {tab === 'hackathonWins' && 'Hackathon Wins'}
            </button>
          ))}
        </div>

        {/* Search & Sort Section */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <input
            type="text"
            className="px-4 py-2 rounded-md bg-gray-800 text-white placeholder-gray-400"
            placeholder="Search by username"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="px-4 py-2 rounded-md bg-gray-800 text-white"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="asc">Sort by Points (Asc)</option>
            <option value="desc">Sort by Points (Desc)</option>
          </select>
        </div>

        {/* Leaderboard Content */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-8 rounded-lg shadow-lg space-y-6">
          <h2 className="leaderboard-header text-3xl font-bold text-center text-white">
            {selectedTab === 'codeforces' && 'Codeforces Leaderboard'}
            {selectedTab === 'leetcode' && 'Leetcode Leaderboard'}
            {selectedTab === 'dailyChallenges' && 'Daily Challenges Leaderboard'}
            {selectedTab === 'hackathonWins' && 'Hackathon Wins Leaderboard'}
          </h2>
          <table className="leaderboard-table w-full text-gray-300">
            <thead>
              <tr>
                <th className="py-2 text-left pl-4">Rank</th>
                <th className="py-2 text-left">Username</th>
                <th className="py-2 text-left">Points/Wins</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((entry) => (
                <tr key={entry.rank} className="border-t border-gray-700 hover:bg-gray-700 transition-all duration-200">
                  <td className="py-3 pl-4">{entry.rank}</td>
                  <td className="py-3">{entry.username}</td>
                  <td className="py-3">{entry.points || entry.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md disabled:opacity-50 hover:opacity-75"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md disabled:opacity-50 hover:opacity-75"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;