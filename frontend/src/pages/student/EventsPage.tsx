import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Star,
  QrCode
} from 'lucide-react';
import { formatDate, getEventTypeColor } from '@/lib/utils';

interface Event {
  id: number;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  registration_deadline: string | null;
  created_at: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('all');
  const [registering, setRegistering] = useState<number | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getEvents();
      setEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: number) => {
    setRegistering(eventId);
    try {
      const response = await eventsAPI.registerForEvent(eventId);
      alert(response.data.message);
      fetchEvents(); // Refresh events to update registration status
    } catch (error: any) {
      alert(error.response?.data?.error || 'Registration failed');
    } finally {
      setRegistering(null);
    }
  };

  const handleCheckIn = async (eventId: number) => {
    try {
      const response = await eventsAPI.checkInEvent(eventId);
      alert(response.data.message);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-in failed');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    
    let matchesDate = true;
    if (filterDate !== 'all') {
      const eventDate = new Date(event.start_date);
      const now = new Date();
      
      switch (filterDate) {
        case 'today':
          matchesDate = eventDate.toDateString() === now.toDateString();
          break;
        case 'this_week':
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          matchesDate = eventDate >= now && eventDate <= weekFromNow;
          break;
        case 'this_month':
          matchesDate = eventDate.getMonth() === now.getMonth() && 
                       eventDate.getFullYear() === now.getFullYear();
          break;
        case 'upcoming':
          matchesDate = eventDate > now;
          break;
      }
    }
    
    return matchesSearch && matchesType && matchesDate;
  });

  const isEventToday = (startDate: string) => {
    const eventDate = new Date(startDate);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isRegistrationOpen = (deadline: string | null) => {
    if (!deadline) return true;
    return new Date(deadline) > new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Events</h1>
          <p className="text-muted-foreground">Discover and register for upcoming campus events</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="hackathon">Hackathon</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="fest">Fest</SelectItem>
                <SelectItem value="seminar">Seminar</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Date Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="this_week">This Week</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{event.title}</CardTitle>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(event.event_type)}`}>
                          {event.event_type}
                        </span>
                        {isEventToday(event.start_date) && (
                          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            Today
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 line-clamp-3">
                    {event.description}
                  </CardDescription>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.start_date)}
                    </div>
                    {event.location && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-2" />
                      Max {event.max_participants} participants
                    </div>
                    {event.registration_deadline && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        Registration until {formatDate(event.registration_deadline)}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      onClick={() => handleRegister(event.id)}
                      disabled={registering === event.id || !isRegistrationOpen(event.registration_deadline)}
                    >
                      {registering === event.id ? 'Registering...' : 'Register'}
                    </Button>
                    {isEventToday(event.start_date) && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCheckIn(event.id)}
                        title="Check-in with QR Code"
                      >
                        <QrCode className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No events found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
