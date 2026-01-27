import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Exercises() {
  const [allProblems, setAllProblems] = useState([]);
  const [displayedProblems, setDisplayedProblems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const problemsPerPage = 20;

  useEffect(() => {
    setLoading(true);
    fetchProblems();

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await fetch("https://codeforces.com/api/problemset.problems");
      const data = await response.json();
      if (data.status === "OK") {
        setAllProblems(data.result.problems);
      }
    } catch (error) {
      console.error("Error fetching problems:", error);
    }
    setLoading(false);
  };

  // Filter and paginate problems
  useEffect(() => {
    let filtered = allProblems;

    if (searchQuery) {
      filtered = filtered.filter((problem) =>
        problem.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedTag) {
      filtered = filtered.filter((problem) => problem.tags.includes(selectedTag));
    }

    const startIndex = (currentPage - 1) * problemsPerPage;
    const endIndex = startIndex + problemsPerPage;
    setDisplayedProblems(filtered.slice(startIndex, endIndex));
  }, [searchQuery, selectedTag, allProblems, currentPage]);

  // Get unique tags
  const uniqueTags = [...new Set(allProblems.flatMap((problem) => problem.tags))];

  // Calculate total pages
  const totalPages = Math.ceil(allProblems.length / problemsPerPage);

  // Generate pagination buttons (only 10 at a time)
  const getPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 10;
    const startPage = Math.max(
      1,
      Math.min(currentPage - Math.floor(maxButtons / 2), totalPages - maxButtons + 1)
    );

    for (let i = startPage; i < startPage + maxButtons && i <= totalPages; i++) {
      buttons.push(
        <button
          key={i}
          className={`px-4 py-2 rounded-md border transition-colors duration-200 ${
            currentPage === i
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
          }`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <>
        {startPage > 1 && (
          <button
            className="px-4 py-2 rounded-md border bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
        )}
        {startPage > 2 && <span className="px-4 py-2 text-gray-400">...</span>}
        {buttons}
        {startPage + maxButtons - 1 < totalPages - 1 && (
          <span className="px-4 py-2 text-gray-400">...</span>
        )}
        {startPage + maxButtons - 1 < totalPages && (
          <button
            className="px-4 py-2 rounded-md border bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
            onClick={() => setCurrentPage(totalPages)}
          >
            {totalPages}
          </button>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-gray-200 py-8 px-4 sm:px-10 lg:px-16 mt-20 transition-all duration-300">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10 text-white">
        Exercises
      </h1>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search by problem name..."
          className="flex-1 p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="p-3 bg-gray-800 text-white border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          value={selectedTag}
          onChange={(e) => {
            setSelectedTag(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Tags</option>
          {uniqueTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <>
          {/* Loading Skeleton for Problem Cards */}
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-md my-3 animate-pulse">
                <div className="h-6 w-3/4 bg-gray-700 rounded mb-3"></div>
                <div className="h-5 w-1/2 bg-gray-700 rounded mb-3"></div>
                <div className="h-5 w-1/3 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          {/* Loading Skeleton for Pagination */}
          <div className="flex justify-center mt-4 space-x-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-10 w-10 bg-gray-700 animate-pulse rounded-md"></div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Problems List as Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedProblems.map((problem) => (
              <div
                key={`${problem.contestId}-${problem.index}`}
                className="p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-md hover:bg-gray-700 transition-colors duration-300"
              >
                <h2 className="text-xl font-bold text-white">{problem.name}</h2>
                <p className="text-gray-400 mt-1">
                  Tags: {problem.tags.join(", ") || "None"}
                </p>
                <a
                  href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 block text-blue-400 hover:underline"
                >
                  View Problem Statement
                </a>
                <Link to = "/editor" className="text-blue-400 hover:underline">
                  Solve on Editor
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center mt-8 space-x-2">{getPaginationButtons()}</div>
    </div>
  );
}

export default Exercises;
