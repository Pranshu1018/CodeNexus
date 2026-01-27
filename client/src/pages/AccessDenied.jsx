import { Link } from "react-router-dom";

const AccessDenied = () => {
  return (
    <div className="overflow-hidden min-h-screen flex items-center justify-center bg-gray-900 text-white relative">
      <canvas id="matrix-canvas" className="fixed top-0 left-0 w-full h-full -z-10 opacity-20"></canvas>
      
      <div className="relative text-center max-w-lg p-8 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-xl">
        <div className="absolute -top-3 -left-3 w-full h-full bg-gradient-to-br from-red-500/20 to-blue-500/20 rounded-lg -z-10 blur-xl"></div>
        
        <h1 className="text-4xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-300 text-lg mt-4">
          You do not have the necessary permissions to access this page.
        </p>
        
        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          <Link to="/" className="px-6 py-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-semibold transition">
            Go Home
          </Link>
          <Link to="/contact" className="px-6 py-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white font-semibold transition">
            Contact Support
          </Link>
        </div>
      </div>
      
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute -left-10 -top-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default AccessDenied;