import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { eventsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Edit,
  Trash2,
  Eye
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

const AdminEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [creating, setCreating] = useState(false);

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

  const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      event_type: formData.get('event_type') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      location: formData.get('location') as string,
      max_participants: parseInt(formData.get('max_participants') as string),
      registration_deadline: formData.get('registration_deadline') as string || undefined,
    };

    try {
      await eventsAPI.createEvent(data);
      setCreateDialogOpen(false);
      fetchEvents();
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create event');
    } finally {
      setCreating(false);
    }
  };

  const handleEditEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedEvent) return;

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      event_type: formData.get('event_type') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      location: formData.get('location') as string,
      max_participants: parseInt(formData.get('max_participants') as string),
      registration_deadline: formData.get('registration_deadline') as string || undefined,
    };

    try {
      await eventsAPI.updateEvent(selectedEvent.id, data);
      setEditDialogOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      await eventsAPI.deleteEvent(eventId);
      fetchEvents();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.event_type === filterType;
    return matchesSearch && matchesType;
  });

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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Event Management</h1>
            <p className="text-muted-foreground">Create, edit, and manage campus events</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new campus event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title</Label>
                    <Input id="title" name="title" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="event_type">Event Type</Label>
                    <Select name="event_type" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="fest">Fest</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input id="description" name="description" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date & Time</Label>
                    <Input id="start_date" name="start_date" type="datetime-local" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date & Time</Label>
                    <Input id="end_date" name="end_date" type="datetime-local" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" name="location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_participants">Max Participants</Label>
                    <Input id="max_participants" name="max_participants" type="number" min="1" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_deadline">Registration Deadline (Optional)</Label>
                  <Input id="registration_deadline" name="registration_deadline" type="datetime-local" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creating}>
                    {creating ? 'Creating...' : 'Create Event'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
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
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
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
              <p>Create your first event or adjust your search filters</p>
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
              <DialogDescription>
                Update the event details
              </DialogDescription>
            </DialogHeader>
            {selectedEvent && (
              <form onSubmit={handleEditEvent} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_title">Event Title</Label>
                    <Input id="edit_title" name="title" defaultValue={selectedEvent.title} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_event_type">Event Type</Label>
                    <Select name="event_type" defaultValue={selectedEvent.event_type} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="fest">Fest</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_description">Description</Label>
                  <Input id="edit_description" name="description" defaultValue={selectedEvent.description} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_start_date">Start Date & Time</Label>
                    <Input 
                      id="edit_start_date" 
                      name="start_date" 
                      type="datetime-local" 
                      defaultValue={selectedEvent.start_date.slice(0, 16)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_end_date">End Date & Time</Label>
                    <Input 
                      id="edit_end_date" 
                      name="end_date" 
                      type="datetime-local" 
                      defaultValue={selectedEvent.end_date.slice(0, 16)}
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_location">Location</Label>
                    <Input id="edit_location" name="location" defaultValue={selectedEvent.location} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_max_participants">Max Participants</Label>
                    <Input 
                      id="edit_max_participants" 
                      name="max_participants" 
                      type="number" 
                      min="1" 
                      defaultValue={selectedEvent.max_participants}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_registration_deadline">Registration Deadline (Optional)</Label>
                  <Input 
                    id="edit_registration_deadline" 
                    name="registration_deadline" 
                    type="datetime-local" 
                    defaultValue={selectedEvent.registration_deadline ? selectedEvent.registration_deadline.slice(0, 16) : ''}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Event
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminEventsPage;
