import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/contact', (req, res) => {
  // Placeholder for contact form submission
  console.log('Contact form received:', req.body);
  res.status(200).json({ message: 'Message received successfully.' });
});

app.get('/api/leetcode/:username', async (req, res) => {
  const { username } = req.params;
  const query = `
    query userProblemsSolved($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  try {
    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { username } })
    });

    const data = await response.json();
    if (data.data?.matchedUser) {
      const stats = data.data.matchedUser.submitStatsGlobal.acSubmissionNum;
      const easy = stats.find((s: any) => s.difficulty === 'Easy')?.count || 0;
      const medium = stats.find((s: any) => s.difficulty === 'Medium')?.count || 0;
      const hard = stats.find((s: any) => s.difficulty === 'Hard')?.count || 0;
      res.json({ easySolved: easy, mediumSolved: medium, hardSolved: hard });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('LeetCode API error:', error);
    res.status(500).json({ error: 'Failed to fetch LeetCode data' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
