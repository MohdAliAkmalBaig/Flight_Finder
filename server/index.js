import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { User, Booking, Flight } from './schemas.js';

dotenv.config();

const app = express();

// ✅ CORS - allow all Vercel preview domains and localhost
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman, curl, etc.

    const allowedOrigins = [
      'https://flight-finder-2g25.vercel.app'
    ];

    const isAllowed = allowedOrigins.includes(origin) || /vercel\.app$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

const PORT = process.env.PORT || 6002;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('✅ MongoDB connected');

    // ✅ USER ROUTES
    app.post('/register', async (req, res) => {
      console.log('📥 /register called with:', req.body);
      const { username, email, usertype, password } = req.body;
      if (!username || !email || !usertype || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      let approval = usertype === 'flight-operator' ? 'not-approved' : 'approved';
      try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, usertype, password: hashedPassword, approval });
        const userCreated = await newUser.save();
        return res.status(201).json(userCreated);
      } catch (error) {
        console.error('❌ Register error:', error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    app.post('/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });

        return res.json(user);
      } catch (error) {
        console.error('❌ Login error:', error);
        return res.status(500).json({ message: 'Server Error' });
      }
    });

    app.post('/approve-operator', async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findById(id);
        user.approval = 'approved';
        await user.save();
        res.json({ message: 'approved!' });
      } catch (err) {
        res.status(500).json({ message: 'Server Error' });
      }
    });

    app.post('/reject-operator', async (req, res) => {
      const { id } = req.body;
      try {
        const user = await User.findById(id);
        user.approval = 'rejected';
        await user.save();
        res.json({ message: 'rejected!' });
      } catch (err) {
        res.status(500).json({ message: 'Server Error' });
      }
    });

    app.get('/fetch-user/:id', async (req, res) => {
      try {
        const user = await User.findById(req.params.id);
        res.json(user);
      } catch (err) {
        console.error(err);
      }
    });

    app.get('/fetch-users', async (req, res) => {
      try {
        const users = await User.find();
        res.json(users);
      } catch (err) {
        res.status(500).json({ message: 'error occurred' });
      }
    });

    // ✅ FLIGHT ROUTES
    app.post('/add-flight', async (req, res) => {
      try {
        const flight = new Flight(req.body);
        await flight.save();
        res.json({ message: 'flight added' });
      } catch (err) {
        res.status(400).json({ message: 'Validation failed', error: err.message });
      }
    });

    app.put('/update-flight', async (req, res) => {
      const { _id, ...rest } = req.body;
      try {
        await Flight.findByIdAndUpdate(_id, rest);
        res.json({ message: 'flight updated' });
      } catch (err) {
        res.status(400).json({ message: 'Update failed', error: err.message });
      }
    });

    app.get('/fetch-flights', async (req, res) => {
      try {
        const flights = await Flight.find();
        res.json(flights);
      } catch (err) {
        console.error(err);
      }
    });

    app.get('/fetch-flight/:id', async (req, res) => {
      try {
        const flight = await Flight.findById(req.params.id);
        res.json(flight);
      } catch (err) {
        console.error(err);
      }
    });

    // ✅ BOOKING ROUTES
    app.get('/fetch-bookings', async (req, res) => {
      try {
        const bookings = await Booking.find();
        res.json(bookings);
      } catch (err) {
        console.error(err);
      }
    });

    app.post('/book-ticket', async (req, res) => {
      const { user, flight, seatClass, passengers } = req.body;
      try {
        const bookings = await Booking.find({ flight, seatClass });
        const numBookedSeats = bookings.reduce((acc, b) => acc + b.passengers.length, 0);

        const seatCode = { 'economy': 'E', 'premium-economy': 'P', 'business': 'B', 'first-class': 'A' };
        const coach = seatCode[seatClass];
        const seats = passengers.map((_, i) => `${coach}-${numBookedSeats + i + 1}`).join(', ');

        const booking = new Booking({ ...req.body, seats });
        await booking.save();
        res.json({ message: 'Booking successful!!' });
      } catch (err) {
        console.error(err);
      }
    });

    app.put('/cancel-ticket/:id', async (req, res) => {
      try {
        const booking = await Booking.findById(req.params.id);
        booking.bookingStatus = 'cancelled';
        await booking.save();
        res.json({ message: 'booking cancelled' });
      } catch (err) {
        console.error(err);
      }
    });

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((e) => console.log(`❌ DB connection failed: ${e}`));
