import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Download, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  FileText
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportData {
  eventPopularity: Array<{
    title: string;
    registrations: number;
    attendance: number;
    attendance_rate: number;
  }>;
  studentParticipation: Array<{
    name: string;
    student_id: string;
    events_attended: number;
    total_registrations: number;
  }>;
  topStudents: Array<{
    name: string;
    student_id: string;
    attendance_count: number;
  }>;
  eventTypeStats: Array<{
    type: string;
    count: number;
    total_registrations: number;
  }>;
}

const AdminReportsPage: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('overview');

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // In a real app, you'd have separate API endpoints for reports
      // For now, we'll use the dashboard data and simulate report data
      const dashboardResponse = await dashboardAPI.getAdminDashboard();
      const leaderboardResponse = await dashboardAPI.getLeaderboard();
      
      // Simulate report data based on dashboard data
      const mockReportData: ReportData = {
        eventPopularity: [
          { title: 'Tech Hackathon 2024', registrations: 150, attendance: 120, attendance_rate: 80 },
          { title: 'AI Workshop', registrations: 80, attendance: 75, attendance_rate: 94 },
          { title: 'Cultural Fest', registrations: 200, attendance: 180, attendance_rate: 90 },
          { title: 'Career Seminar', registrations: 60, attendance: 55, attendance_rate: 92 },
        ],
        studentParticipation: [
          { name: 'John Doe', student_id: '2024001', events_attended: 8, total_registrations: 10 },
          { name: 'Jane Smith', student_id: '2024002', events_attended: 6, total_registrations: 8 },
          { name: 'Mike Johnson', student_id: '2024003', events_attended: 5, total_registrations: 7 },
          { name: 'Sarah Wilson', student_id: '2024004', events_attended: 4, total_registrations: 6 },
        ],
        topStudents: leaderboardResponse.data,
        eventTypeStats: [
          { type: 'Hackathon', count: 3, total_registrations: 200 },
          { type: 'Workshop', count: 5, total_registrations: 150 },
          { type: 'Seminar', count: 4, total_registrations: 120 },
          { type: 'Fest', count: 2, total_registrations: 300 },
        ]
      };
      
      setReportData(mockReportData);
    } catch (error) {
      console.error('Failed to fetch report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = (format: 'csv' | 'excel') => {
    // In a real app, you'd call an API endpoint to generate and download the report
    alert(`Exporting report as ${format.toUpperCase()}...`);
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
            <h1 className="text-3xl font-bold text-foreground mb-2">Reports & Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights into campus events and student participation</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExportReport('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExportReport('excel')}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Report Type Selector */}
        <div className="mb-8">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview Dashboard</SelectItem>
              <SelectItem value="events">Event Popularity</SelectItem>
              <SelectItem value="students">Student Participation</SelectItem>
              <SelectItem value="analytics">Analytics & Trends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Dashboard */}
        {selectedReport === 'overview' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">14</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">770</div>
                    <p className="text-xs text-muted-foreground">+15% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Attendance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">89%</div>
                    <p className="text-xs text-muted-foreground">+3% from last month</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">156</div>
                    <p className="text-xs text-muted-foreground">+8 from last month</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Event Types Distribution</CardTitle>
                    <CardDescription>Events by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={reportData?.eventTypeStats || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, count }) => `${type} (${count})`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {(reportData?.eventTypeStats || []).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Registration Trends</CardTitle>
                    <CardDescription>Monthly registration patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={[
                        { month: 'Jan', registrations: 65 },
                        { month: 'Feb', registrations: 78 },
                        { month: 'Mar', registrations: 90 },
                        { month: 'Apr', registrations: 85 },
                        { month: 'May', registrations: 95 },
                        { month: 'Jun', registrations: 110 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="registrations" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        )}

        {/* Event Popularity Report */}
        {selectedReport === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Event Popularity Report</CardTitle>
                <CardDescription>Events ranked by registrations and attendance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.eventPopularity.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.registrations} registrations • {event.attendance} attended
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{event.attendance_rate}%</div>
                        <div className="text-sm text-muted-foreground">attendance rate</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Student Participation Report */}
        {selectedReport === 'students' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Student Participation Report</CardTitle>
                <CardDescription>Student engagement and attendance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportData?.studentParticipation.map((student, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-muted-foreground">{student.student_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{student.events_attended}/{student.total_registrations}</div>
                        <div className="text-sm text-muted-foreground">events attended</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Analytics & Trends */}
        {selectedReport === 'analytics' && (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Students</CardTitle>
                  <CardDescription>Students with highest event attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData?.topStudents.slice(0, 5).map((student, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">{student.student_id}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{student.attendance_count}</div>
                          <div className="text-sm text-muted-foreground">events attended</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Event Type Performance</CardTitle>
                  <CardDescription>Registration patterns by event type</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData?.eventTypeStats || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total_registrations" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
