import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trophy, 
  Medal, 
  Award, 
  Star,
  Users,
  Target
} from 'lucide-react';

interface LeaderboardEntry {
  name: string;
  student_id: string;
  attendance_count: number;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await dashboardAPI.getLeaderboard();
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 1:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-amber-500 to-amber-700 text-white';
      default:
        return 'bg-card border';
    }
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
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Leaderboard</h1>
          <p className="text-muted-foreground">Top performers based on event attendance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leaderboard.length}</div>
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
                <CardTitle className="text-sm font-medium">Top Performer</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaderboard.length > 0 ? leaderboard[0].attendance_count : 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {leaderboard.length > 0 ? leaderboard[0].name : 'No data'}
                </p>
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
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leaderboard.length > 0 
                    ? Math.round(leaderboard.reduce((sum, entry) => sum + entry.attendance_count, 0) / leaderboard.length)
                    : 0
                  }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Leaderboard */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2" />
                Top Performers
              </CardTitle>
              <CardDescription>
                Students ranked by total event attendance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.student_id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center justify-between p-4 rounded-lg ${getRankColor(index)}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8">
                        {getRankIcon(index)}
                      </div>
                      <div>
                        <div className="font-semibold">{entry.name}</div>
                        <div className="text-sm opacity-80">{entry.student_id}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4" />
                      <span className="font-bold">{entry.attendance_count}</span>
                      <span className="text-sm opacity-80">events</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No leaderboard data</h3>
                    <p>Students need to attend events to appear on the leaderboard</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievement Badges */}
        <div className="max-w-4xl mx-auto mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Badges</CardTitle>
              <CardDescription>
                Special recognition for outstanding participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                    <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Event Champion</div>
                    <div className="text-sm text-muted-foreground">Top 3 performers</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <Star className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Active Participant</div>
                    <div className="text-sm text-muted-foreground">5+ events attended</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-full">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Consistent Learner</div>
                    <div className="text-sm text-muted-foreground">Regular attendance</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
