import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    user_type: 'musician',
    role_category: '',
    contact: '',
    emergency_contact: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const roleOptions = {
    musician: ['Drums', 'Guitar', 'Bass', 'Keys', 'Horn', 'Vocal', 'Other'],
    sound_engineer: ['FOH Engineer', 'Monitor Engineer', 'System Tech'],
    lighting_engineer: ['Lighting Tech', 'Lighting Designer']
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Reset role_category when user_type changes
    if (name === 'user_type' && !['manager', 'musical_director', 'head_of_sound'].includes(value)) {
      setFormData(prev => ({ ...prev, role_category: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate role_category is selected for staff roles
    if (['musician', 'sound_engineer', 'lighting_engineer'].includes(formData.user_type) && !formData.role_category) {
      setError('Please select your specific role');
      return;
    }

    setLoading(true);

    const result = await register(formData);
    
    if (!result.success) {
      setError(result.error);
      setLoading(false);
    }
  };

  const needsRoleCategory = ['musician', 'sound_engineer', 'lighting_engineer'].includes(formData.user_type);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                name="password"
                type="password"
                required
                minLength="6"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">User Type</label>
              <select
                name="user_type"
                required
                value={formData.user_type}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="musician">Musician</option>
                <option value="sound_engineer">Sound Engineer</option>
                <option value="lighting_engineer">Lighting Engineer</option>
                <option value="musical_director">Musical Director</option>
                <option value="head_of_sound">Head of Sound</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            {needsRoleCategory && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specific Role *
                </label>
                <select
                  name="role_category"
                  required
                  value={formData.role_category}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select your role...</option>
                  {roleOptions[formData.user_type]?.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  You will only see events that need your specific role
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Contact</label>
              <input
                name="contact"
                type="tel"
                required
                value={formData.contact}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
              <input
                name="emergency_contact"
                type="tel"
                value={formData.emergency_contact}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
