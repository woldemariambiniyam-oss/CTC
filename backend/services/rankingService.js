const pool = require('../config/database');

class RankingService {
  async calculateRanking(traineeId, sessionId) {
    try {
      // Get exam scores
      const [examScores] = await pool.execute(
        `SELECT 
          COALESCE(SUM(ea.score), 0) as total_exam_score,
          COALESCE(SUM(ea.total_points), 0) as total_exam_points,
          COUNT(ea.id) as exam_count
        FROM exam_attempts ea
        JOIN examinations e ON ea.exam_id = e.id
        WHERE ea.trainee_id = ? AND e.session_id = ? AND ea.status = 'submitted'`,
        [traineeId, sessionId]
      );

      // Get attendance score
      const [attendance] = await pool.execute(
        `SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended_sessions
        FROM session_enrollments
        WHERE trainee_id = ? AND session_id = ?`,
        [traineeId, sessionId]
      );

      // Get trainer assessments
      const [assessments] = await pool.execute(
        `SELECT 
          COALESCE(AVG(score), 0) as avg_practical_score,
          COUNT(*) as assessment_count
        FROM trainer_assessments
        WHERE trainee_id = ? AND session_id = ?`,
        [traineeId, sessionId]
      );

      // Calculate scores (weighted)
      const examScore = examScores[0]?.total_exam_score || 0;
      const examMaxScore = examScores[0]?.total_exam_points || 1;
      const examPercentage = examMaxScore > 0 ? (examScore / examMaxScore) * 100 : 0;

      const totalSessions = attendance[0]?.total_sessions || 1;
      const attendedSessions = attendance[0]?.attended_sessions || 0;
      const attendanceScore = (attendedSessions / totalSessions) * 100;

      const practicalScore = assessments[0]?.avg_practical_score || 0;

      // Weighted total score (40% exam, 30% attendance, 30% practical)
      const totalScore = (examPercentage * 0.4) + (attendanceScore * 0.3) + (practicalScore * 0.3);

      // Determine performance level
      let performanceLevel = 'beginner';
      if (totalScore >= 80) {
        performanceLevel = 'advanced';
      } else if (totalScore >= 60) {
        performanceLevel = 'intermediate';
      }

      // Save or update ranking
      await pool.execute(
        `INSERT INTO trainee_rankings 
         (trainee_id, session_id, total_score, exam_score, attendance_score, practical_score, performance_level)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         total_score = VALUES(total_score),
         exam_score = VALUES(exam_score),
         attendance_score = VALUES(attendance_score),
         practical_score = VALUES(practical_score),
         performance_level = VALUES(performance_level),
         calculated_at = NOW()`,
        [traineeId, sessionId, totalScore, examPercentage, attendanceScore, practicalScore, performanceLevel]
      );

      // Update leaderboard
      await this.updateLeaderboard(sessionId);

      return {
        totalScore,
        examScore: examPercentage,
        attendanceScore,
        practicalScore,
        performanceLevel
      };
    } catch (error) {
      console.error('Error calculating ranking:', error);
      throw error;
    }
  }

  async updateLeaderboard(sessionId) {
    try {
      // Get all rankings for the session
      const [rankings] = await pool.execute(
        `SELECT trainee_id, total_score, performance_level
         FROM trainee_rankings
         WHERE session_id = ?
         ORDER BY total_score DESC`,
        [sessionId]
      );

      // Clear existing leaderboard
      await pool.execute(
        'DELETE FROM leaderboards WHERE session_id = ?',
        [sessionId]
      );

      // Insert updated rankings
      for (let i = 0; i < rankings.length; i++) {
        await pool.execute(
          `INSERT INTO leaderboards (session_id, trainee_id, rank_position, total_score, performance_level)
           VALUES (?, ?, ?, ?, ?)`,
          [sessionId, rankings[i].trainee_id, i + 1, rankings[i].total_score, rankings[i].performance_level]
        );
      }
    } catch (error) {
      console.error('Error updating leaderboard:', error);
      throw error;
    }
  }

  async getLeaderboard(sessionId, limit = 10) {
    try {
      const [leaderboard] = await pool.execute(
        `SELECT 
          l.rank_position,
          l.total_score,
          l.performance_level,
          u.first_name,
          u.last_name,
          u.email
        FROM leaderboards l
        JOIN users u ON l.trainee_id = u.id
        WHERE l.session_id = ?
        ORDER BY l.rank_position ASC
        LIMIT ?`,
        [sessionId, limit]
      );

      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      throw error;
    }
  }
}

module.exports = new RankingService();

