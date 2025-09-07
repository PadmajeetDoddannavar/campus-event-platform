import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI, eventsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Star, 
  MessageSquare,
  QrCode,
  Download
} from 'lucide-react';
import { formatDate, getEventTypeColor } from '@/lib/utils';

interface Registration {
  event_id: number;
  title: string;
  event_type: string;
  start_date: string;
  status: string;
  registered_at: string;
}

interface Attendance {
  event_id: number;
  title: string;
  checked_in_at: string;
}

interface Feedback {
  event_id: number;
  title: string;
  rating: number;
  comment: string;
  submitted_at: string;
}

const MyEventsPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingFeedback, setSubmittingFeedback] = useState<number | null>(null);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await dashboardAPI.getStudentDashboard();
      setRegistrations(response.data.registrations);
      setAttendance(response.data.attendance);
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Failed to fetch my events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (eventId: number) => {
    try {
      const response = await eventsAPI.checkInEvent(eventId);
      alert(response.data.message);
      fetchMyEvents(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.error || 'Check-in failed');
    }
  };

  const handleSubmitFeedback = async (eventId: number, rating: number, comment: string) => {
    setSubmittingFeedback(eventId);
    try {
      await eventsAPI.submitFeedback(eventId, { rating, comment });
      alert('Feedback submitted successfully!');
      fetchMyEvents(); // Refresh data
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmittingFeedback(null);
    }
  };

  const handleDownloadCertificate = async (eventId: number) => {
    try {
      const response = await dashboardAPI.generateCertificate(eventId, 1); // Student ID from context
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${response.data.certificate}`;
      link.download = `certificate-${eventId}.pdf`;
      link.click();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate certificate');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'waitlisted':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isEventToday = (startDate: string) => {
    const eventDate = new Date(startDate);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  };

  const isEventPast = (startDate: string) => {
    return new Date(startDate) < new Date();
  };

  const hasAttended = (eventId: number) => {
    return attendance.some(att => att.event_id === eventId);
  };

  const hasGivenFeedback = (eventId: number) => {
    return feedback.some(fb => fb.event_id === eventId);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">My Events</h1>
          <p className="text-muted-foreground">Manage your event registrations, attendance, and feedback</p>
        </div>

        <Tabs defaultValue="registrations" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="registrations">Registrations</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registrations.map((reg, index) => (
                <motion.div
                  key={reg.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{reg.title}</CardTitle>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${getEventTypeColor(reg.event_type)}`}>
                              {reg.event_type}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reg.status)}`}>
                              {reg.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(reg.start_date)}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-2" />
                          Registered {formatDate(reg.registered_at)}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        {isEventToday(reg.start_date) && reg.status === 'registered' && !hasAttended(reg.event_id) && (
                          <Button
                            onClick={() => handleCheckIn(reg.event_id)}
                            className="w-full"
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Check In
                          </Button>
                        )}
                        
                        {isEventPast(reg.start_date) && hasAttended(reg.event_id) && !hasGivenFeedback(reg.event_id) && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              const rating = prompt('Rate this event (1-5):');
                              const comment = prompt('Leave a comment (optional):');
                              if (rating && parseInt(rating) >= 1 && parseInt(rating) <= 5) {
                                handleSubmitFeedback(reg.event_id, parseInt(rating), comment || '');
                              }
                            }}
                            className="w-full"
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Give Feedback
                          </Button>
                        )}

                        {isEventPast(reg.start_date) && hasAttended(reg.event_id) && (
                          <Button
                            variant="outline"
                            onClick={() => handleDownloadCertificate(reg.event_id)}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Certificate
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {registrations.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No registrations yet</h3>
                  <p>Register for events to see them here</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {attendance.map((att, index) => (
                <motion.div
                  key={att.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{att.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Attended
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Checked in {formatDate(att.checked_in_at)}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {attendance.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No attendance records</h3>
                  <p>Check in to events to see your attendance here</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedback.map((fb, index) => (
                <motion.div
                  key={fb.event_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-lg mb-2">{fb.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < fb.rating 
                                  ? 'text-yellow-400 fill-current' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submitted {formatDate(fb.submitted_at)}
                        </div>
                        {fb.comment && (
                          <div className="text-sm bg-muted p-3 rounded">
                            "{fb.comment}"
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {feedback.length === 0 && (
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No feedback given</h3>
                  <p>Submit feedback for attended events to see them here</p>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MyEventsPage;
