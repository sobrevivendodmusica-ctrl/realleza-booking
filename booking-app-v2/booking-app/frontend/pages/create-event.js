import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { events as eventsAPI } from '../utils/api';

const AVAILABLE_POSITIONS = {
  Musicians: ['Drums', 'Guitar', 'Bass', 'Keys', 'Horn', 'Vocal', 'Other'],
  'Sound Engineers': ['FOH Engineer', 'Monitor Engineer', 'System Tech'],
  'Lighting Engineers': ['Lighting Tech', 'Lighting Designer']
};

export default function CreateEvent() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: '',
    space: '',
    time: '',
    event_name: '',
    notes: ''
  });
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addPosition = (position) => {
    if (!selectedPositions.find(p => p.role === position)) {
      setSelectedPositions([...selectedPositions, { role: position, quantity: 1 }]);
    }
  };

  const removePosition = (position) => {
    setSelectedPositions(selectedPositions.filter(p => p.role !== position));
  };

  const updateQuantity = (position, quantity) => {
    setSelectedPositions(selectedPositions.map(p => 
      p.role === position ? { ...p, quantity: parseInt(quantity) || 1 } : p
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedPositions.length === 0) {
      setError('Please select at least one position');
      return;
    }

    setLoading(true);

    try {
      await eventsAPI.create({
        ...formData,
        positions: selectedPositions
      });

      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create event');
      setLoading(false);
    }
  };

  if (user?.user_type !== 'manager') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied. Only managers can create events.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Create Event</h1>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Name *
                </label>
                <input
                  name="event_name"
                  type="text"
                  required
                  value={formData.event_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Saturday Night Jazz"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  name="date"
                  type="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue *
                </label>
                <input
                  name="space"
                  type="text"
                  required
                  value={formData.space}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Main Stage"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <input
                  name="time"
                  type="text"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 19:00-22:00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details..."
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Positions Needed *</h3>
              
              {Object.entries(AVAILABLE_POSITIONS).map(([category, positions]) => (
                <div key={category} className="mb-4">
                  <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {positions.map(position => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => addPosition(position)}
                        disabled={selectedPositions.find(p => p.role === position)}
                        className={`px-3 py-1 rounded-md text-sm ${
                          selectedPositions.find(p => p.role === position)
                            ? 'bg-green-100 text-green-800 cursor-not-allowed'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {position} {selectedPositions.find(p => p.role === position) && '✓'}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {selectedPositions.length > 0 && (
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-semibold mb-3">Selected Positions:</h4>
                <div className="space-y-2">
                  {selectedPositions.map(pos => (
                    <div key={pos.role} className="flex items-center justify-between">
                      <span className="font-medium">{pos.role}</span>
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Quantity:</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={pos.quantity}
                          onChange={(e) => updateQuantity(pos.role, e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removePosition(pos.role)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Event'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
