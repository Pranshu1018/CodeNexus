import React from 'react';
import { Link } from 'react-router-dom';

const jobRoles = [
  { id: 1, title: "Software Engineer" },
  { id: 2, title: "Data Scientist" },
  { id: 3, title: "Product Manager" },
  { id: 4, title: "UX Designer" },
];

const InterviewHome = () => {
  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center py-10">
      <h1 className="text-5xl text-white font-bold mb-6 text-shadow-lg">Mock Interview</h1>
      <p className="text-xl text-gray-400 mb-8">Choose your role to begin the mock interview:</p>
      <div className="grid grid-cols-2 gap-6">
        {jobRoles.map((role) => (
          <Link
            key={role.id}
            to={`/mi/${role.id}`}
            className="bg-gradient-to-r from-neon-blue to-neon-purple text-white p-6 rounded-lg text-center hover:from-neon-purple hover:to-neon-blue transition duration-300 shadow-neon hover:shadow-2xl transform hover:scale-105"
          >
            {role.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default InterviewHome;
