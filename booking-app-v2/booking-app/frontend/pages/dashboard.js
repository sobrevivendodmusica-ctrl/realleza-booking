import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { events as eventsAPI } from '../utils/api';
import dynamic from 'next/dynamic';

const FullCalendar = dynamic(() => import('@fullcalendar/react'), { ssr: false });
const DayGridPlugin = dynamic(() => import('@fullcalendar/daygrid'), { ssr: false });
const InteractionPlugin = dynamic(() => import('@fullcalendar/interaction'), { ssr: false });

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      const calendarEvents = response.data.events.map(event => ({
        id: event.id,
        title: event.event_name,
        date: event.date,
        className: `fc-event-${event.status}`,
        extendedProps: event
      }));
      setEvents(calendarEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const handleEventClick = async (info) => {
    try {
      const response = await eventsAPI.getOne(info.event.id);
      setSelectedEvent(response.data);
      setShowModal(true);
    } catch (error) {
      console.error('Error loading event details:', error);
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Platform</h1>
            <p className="text-sm text-gray-600">
              {user.name} - {user.user_type.replace('_', ' ').toUpperCase()}
            </p>
          </div>
          <div className="space-x-4">
            {user.user_type === 'manager' && (
              <button
                onClick={() => router.push('/create-event')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Event
              </button>
            )}
            {(user.user_type === 'musician' || user.user_type === 'sound_engineer') && (
              <button
                onClick={() => router.push('/my-availability')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                My Availability
              </button>
            )}
            {(user.user_type === 'musical_director' || user.user_type === 'head_of_sound') && (
              <button
                onClick={() => router.push('/booking-needs')}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                Booking Needs
              </button>
            )}
            {(user.user_type === 'musician' || user.user_type === 'sound_engineer') && (
              <button
                onClick={() => router.push('/my-bookings')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                My Bookings
              </button>
            )}
            <button
              onClick={logout}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Legend */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Event Status:</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Unfilled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Partially Filled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded"></div>
              <span className="text-sm">Completed</span>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white p-6 rounded-lg shadow">
          <FullCalendar
            plugins={[DayGridPlugin, InteractionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            height="auto"
          />
        </div>
      </main>

      {/* Event Details Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">{selectedEvent.event.event_name}</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <p><strong>Date:</strong> {selectedEvent.event.date}</p>
              <p><strong>Time:</strong> {selectedEvent.event.time}</p>
              <p><strong>Venue:</strong> {selectedEvent.event.space}</p>
              <p><strong>Status:</strong> <span className="capitalize">{selectedEvent.event.status.replace('_', ' ')}</span></p>
              {selectedEvent.event.band_requirement && (
                <p><strong>Band Requirement:</strong> {selectedEvent.event.band_requirement}</p>
              )}
              {selectedEvent.event.sound_requirement && (
                <p><strong>Sound Requirement:</strong> {selectedEvent.event.sound_requirement}</p>
              )}
              {selectedEvent.event.notes && (
                <p><strong>Notes:</strong> {selectedEvent.event.notes}</p>
              )}
            </div>

            {selectedEvent.bookings && selectedEvent.bookings.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">Team Roster</h3>
                <div className="space-y-2">
                  {selectedEvent.bookings.map(booking => (
                    <div key={booking.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{booking.position}</p>
                          <p className="text-sm text-gray-600">{booking.staff_name}</p>
                          <p className="text-sm text-gray-500">{booking.contact}</p>
                          {booking.emergency_contact && (
                            <p className="text-sm text-gray-500">Emergency: {booking.emergency_contact}</p>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs rounded ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowModal(false)}
              className="mt-6 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
