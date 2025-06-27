import React, { useEffect, useState } from 'react';
import '../styles/NewFlight.css';
import axios from 'axios';

const NewFlight = () => {
  const [userDetails, setUserDetails] = useState();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const id = localStorage.getItem('userId');
      const response = await axios.get(`https://flight-finder-r7fx.onrender.com/fetch-user/${id}`);
      setUserDetails(response.data);
    } catch (err) {
      console.error("Error fetching user data", err);
    }
  };

  const [flightName, setFlightName] = useState(localStorage.getItem('username') || '');
  const [flightId, setFlightId] = useState('');
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [startTime, setStartTime] = useState('');
  const [arrivalTime, setArrivalTime] = useState('');
  const [totalSeats, setTotalSeats] = useState('');
  const [basePrice, setBasePrice] = useState('');

  const cityOptions = [
    'Chennai', 'Banglore', 'Hyderabad', 'Mumbai', 'Indore', 'Delhi',
    'Pune', 'Trivendrum', 'Bhopal', 'Kolkata', 'varanasi', 'Jaipur'
  ];

  const handleSubmit = async () => {
    // Validation checks
    const seats = parseInt(totalSeats, 10);
    const price = parseFloat(basePrice);

    if (
      !flightId.trim() ||
      !origin ||
      !destination ||
      !startTime ||
      !arrivalTime ||
      totalSeats === '' ||
      basePrice === ''
    ) {
      alert('Please fill all required fields.');
      return;
    }

    if (origin === destination) {
      alert("Origin and destination cannot be the same.");
      return;
    }

    if (isNaN(seats) || isNaN(price) || seats <= 0 || price <= 0) {
      alert('Seats and price must be valid positive numbers.');
      return;
    }

    const inputs = {
      flightName,
      flightId,
      origin,
      destination,
      departureTime: startTime,
      arrivalTime,
      basePrice: price,
      totalSeats: seats,
    };

    try {
      await axios.post('https://flight-finder-r7fx.onrender.com/add-flight', inputs);
      alert('Flight added successfully!');

      // Reset fields
      setFlightId('');
      setOrigin('');
      setDestination('');
      setStartTime('');
      setArrivalTime('');
      setBasePrice('');
      setTotalSeats('');
    } catch (error) {
      alert('Failed to add flight: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="NewFlightPage">
      {userDetails ? (
        userDetails.approval === 'not-approved' ? (
          <div className="notApproved-box">
            <h3>Approval Required!!</h3>
            <p>Your application is under processing. It needs approval from the administrator. Please be patient.</p>
          </div>
        ) : userDetails.approval === 'approved' ? (
          <div className="NewFlightPageContainer">
            <h2>Add New Flight</h2>

            <span className="newFlightSpan1">
              <div className="form-floating mb-3">
                <input type="text" className="form-control" value={flightName} disabled />
                <label>Flight Name</label>
              </div>
              <div className="form-floating mb-3">
                <input type="text" className="form-control" value={flightId} onChange={(e) => setFlightId(e.target.value)} />
                <label>Flight ID</label>
              </div>
            </span>

            <span>
              <div className="form-floating mb-3">
                <select className="form-select" value={origin} onChange={(e) => setOrigin(e.target.value)}>
                  <option value="" disabled>Select</option>
                  {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <label>Departure City</label>
              </div>
              <div className="form-floating mb-3">
                <input type="time" className="form-control" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                <label>Departure Time</label>
              </div>
            </span>

            <span>
              <div className="form-floating mb-3">
                <select className="form-select" value={destination} onChange={(e) => setDestination(e.target.value)}>
                  <option value="" disabled>Select</option>
                  {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                </select>
                <label>Destination City</label>
              </div>
              <div className="form-floating mb-3">
                <input type="time" className="form-control" value={arrivalTime} onChange={(e) => setArrivalTime(e.target.value)} />
                <label>Arrival Time</label>
              </div>
            </span>

            <span className="newFlightSpan2">
              <div className="form-floating mb-3">
                <input type="number" className="form-control" value={totalSeats} onChange={(e) => setTotalSeats(e.target.value)} />
                <label>Total Seats</label>
              </div>
              <div className="form-floating mb-3">
                <input type="number" className="form-control" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
                <label>Base Price</label>
              </div>
            </span>

            <button className="btn btn-primary" onClick={handleSubmit}>Add Now</button>
          </div>
        ) : null
      ) : null}
    </div>
  );
};

export default NewFlight;
