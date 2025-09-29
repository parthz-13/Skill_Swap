const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Hello From Skill Swap.' });
});



app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;


    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }


    const hashedPassword = await bcrypt.hash(password, 10);


    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        skillsOffered: JSON.stringify([]),
        skillsWanted: JSON.stringify([])
      }
    });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});


app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;


    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }


    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});


const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


app.get('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        skillsOffered: true,
        skillsWanted: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const userData = {
      ...user,
      skillsOffered: user.skillsOffered ? JSON.parse(user.skillsOffered) : [],
      skillsWanted: user.skillsWanted ? JSON.parse(user.skillsWanted) : []
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});


app.put('/api/users/me', authMiddleware, async (req, res) => {
  try {
    const { name, bio, skillsOffered, skillsWanted } = req.body;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        name,
        bio: bio || null,
        skillsOffered: JSON.stringify(skillsOffered || []),
        skillsWanted: JSON.stringify(skillsWanted || [])
      }
    });

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});


app.get('/api/users/browse', authMiddleware, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        id: { not: req.userId }
      },
      select: {
        id: true,
        name: true,
        bio: true,
        skillsOffered: true,
        skillsWanted: true
      }
    });

    const parsedUsers = users.map(user => ({
      ...user,
      skillsOffered: user.skillsOffered ? JSON.parse(user.skillsOffered) : [],
      skillsWanted: user.skillsWanted ? JSON.parse(user.skillsWanted) : []
    }));

    res.json(parsedUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to browse users' });
  }
});


app.get('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        name: true,
        bio: true,
        skillsOffered: true,
        skillsWanted: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }


    const userData = {
      ...user,
      skillsOffered: user.skillsOffered ? JSON.parse(user.skillsOffered) : [],
      skillsWanted: user.skillsWanted ? JSON.parse(user.skillsWanted) : []
    };

    res.json(userData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});

