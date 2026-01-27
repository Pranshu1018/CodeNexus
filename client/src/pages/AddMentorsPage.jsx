import { useState } from 'react';
import { createSampleMentors } from '../utils/createSampleMentors';
import { Loader, CheckCircle, Users } from 'lucide-react';

const AddMentorsPage = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddMentors = async () => {
    try {
      setLoading(true);
      await createSampleMentors();
      setSuccess(true);
    } catch (error) {
      console.error('Error:', error);
      alert('Error adding mentors. Check console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
        <Users className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Add Sample Mentors</h1>
        <p className="text-gray-400 mb-6">
          This will add 5 sample mentors to your database for testing.
        </p>
        
        {success ? (
          <div className="text-green-500 flex items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6" />
            <span>Mentors added successfully!</span>
          </div>
        ) : (
          <button
            onClick={handleAddMentors}
            disabled={loading}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Adding Mentors...
              </>
            ) : (
              'Add Sample Mentors'
            )}
          </button>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          After adding, visit /mentor-connect to see them
        </p>
      </div>
    </div>
  );
};

export default AddMentorsPage;
