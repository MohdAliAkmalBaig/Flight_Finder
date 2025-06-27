import React, { useContext, useEffect, useState } from 'react'
import '../styles/LandingPage.css'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { GeneralContext } from '../context/GeneralContext';

const LandingPage = () => {

  const [error, setError] = useState('');
  const [checkBox, setCheckBox] = useState(false);


  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState();
  const [returnDate, setReturnDate] = useState();



  const navigate = useNavigate();
  useEffect(()=>{
    
    if(localStorage.getItem('userType') === 'admin'){
      navigate('/admin');
    } else if(localStorage.getItem('userType') === 'flight-operator'){
      navigate('/flight-admin');
    }
  }, []);

  const [Flights, setFlights] = useState([]);

  const fetchFlights = async () =>{

    if(checkBox){
      if(departure !== "" && destination !== "" && departureDate && returnDate){
        const date = new Date();
        const date1 = new Date(departureDate);
        const date2 = new Date(returnDate);
        if(date1 > date && date2 > date1){
          setError("");
          await axios.get('http://localhost:6002/fetch-flights').then(
              (response)=>{
                setFlights(response.data);
                console.log(response.data)
              }
           )
        } else{ setError("Please check the dates"); }
      } else{ setError("Please fill all the inputs"); }
    }else{
      if(departure !== "" && destination !== "" && departureDate){
        const date = new Date();
        const date1 = new Date(departureDate);
        if(date1 >= date){
          setError("");
          await axios.get('http://localhost:6002/fetch-flights').then(
              (response)=>{
                setFlights(response.data);
                console.log(response.data)
              }
           )
        } else{ setError("Please check the dates"); }      
      } else{ setError("Please fill all the inputs"); }
    }
    }
    const {setTicketBookingDate} = useContext(GeneralContext);
    const userId = localStorage.getItem('userId');


    const handleTicketBooking = async (id, origin, destination) =>{
      if(userId){

          if(origin === departure){
            setTicketBookingDate(departureDate);
            navigate(`/book-flight/${id}`);
          } else if(destination === departure){
            setTicketBookingDate(returnDate);
            navigate(`/book-flight/${id}`);
          }
      }else{
        navigate('/auth');
      }
    }



  return (
    <div className="landingPage">
        <div className="landingHero">


          <div className="landingHero-title">
            <h1 className="banner-h1">Soar to New Heights – Book Your Next Flight with Ease!</h1>
            <p className="banner-p">Discover seamless journeys and explore the world with MD Flights – your adventure begins here.</p>     
          </div>

          

          <div className="Flight-search-container input-container mb-4">

                  {/* <h3>Journey details</h3> */}
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="flexSwitchCheckDefault" value="" onChange={(e)=>setCheckBox(e.target.checked)} />
                    <label className="form-check-label" htmlFor="flexSwitchCheckDefault">Return journey</label>
                  </div>
                  <div className='Flight-search-container-body'>

                    <div className="form-floating">
                      <select className="form-select form-select-sm mb-3"  aria-label=".form-select-sm example" value={departure} onChange={(e)=>setDeparture(e.target.value)}>
                        <option value="" selected disabled>Select</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Banglore">Banglore</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Indore">Indore</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Pune">Pune</option>
                        <option value="Trivendrum">Trivendrum</option>
                        <option value="Bhopal">Bhopal</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="varanasi">varanasi</option>
                        <option value="Jaipur">Jaipur</option>
                      </select>
                      <label htmlFor="floatingSelect">Departure City</label>
                    </div>
                    <div className="form-floating">
                      <select className="form-select form-select-sm mb-3"  aria-label=".form-select-sm example" value={destination} onChange={(e)=>setDestination(e.target.value)}>
                        <option value="" selected disabled>Select</option>
                        <option value="Chennai">Chennai</option>
                        <option value="Banglore">Banglore</option>
                        <option value="Hyderabad">Hyderabad</option>
                        <option value="Mumbai">Mumbai</option>
                        <option value="Indore">Indore</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Pune">Pune</option>
                        <option value="Trivendrum">Trivendrum</option>
                        <option value="Bhopal">Bhopal</option>
                        <option value="Kolkata">Kolkata</option>
                        <option value="varanasi">varanasi</option>
                        <option value="Jaipur">Jaipur</option>
                      </select>
                      <label htmlFor="floatingSelect">Destination City</label>
                    </div>
                    <div className="form-floating mb-3">
                      <input type="date" className="form-control" id="floatingInputstartDate" value={departureDate} onChange={(e)=>setDepartureDate(e.target.value)}/>
                      <label htmlFor="floatingInputstartDate">Journey date</label>
                    </div>
                    {checkBox ?
                    
                      <div className="form-floating mb-3">
                        <input type="date" className="form-control" id="floatingInputreturnDate" value={returnDate} onChange={(e)=>setReturnDate(e.target.value)}/>
                        <label htmlFor="floatingInputreturnDate">Return date</label>
                      </div>
                    
                    :
                    
                    ""}
                    <div>
                      <button className="btn btn-primary" onClick={fetchFlights}>Search</button>
                    </div>

                  </div>
                  <p>{error}</p>
              </div>
                  
                {Flights.length > 0 
                ?
                <>
                {
                  Flights.filter(Flight => Flight.origin === departure && Flight.destination === destination).length > 0 ? 
                  <>
                  <div className="availableFlightsContainer">
                    <h1>Available Flights</h1>

                    <div className="Flights">

                      {checkBox ?
                      
                      <>
                        {Flights.filter(Flight => (Flight.origin === departure && Flight.destination === destination ) || (Flight.origin === destination && Flight.destination === departure)).map((Flight)=>{
                        return(

                        <div className="Flight" key={Flight._id}>
                            <div>
                                <p> <b>{Flight.flightName}</b></p>
                                <p ><b>Flight Number:</b> {Flight.flightId}</p>
                            </div>
                            <div>
                                <p ><b>Start :</b> {Flight.origin}</p>
                                <p ><b>Departure Time:</b> {Flight.departureTime}</p>
                            </div>
                            <div>
                                <p ><b>Destination :</b> {Flight.destination}</p>
                                <p ><b>Arrival Time:</b> {Flight.arrivalTime}</p>
                            </div>
                            <div>
                                <p ><b>Starting Price:</b> {Flight.basePrice}</p>
                                <p ><b>Available Seats:</b> {Flight.totalSeats}</p>
                            </div>
                            <button className="button btn btn-primary" onClick={()=>handleTicketBooking(Flight._id, Flight.origin, Flight.destination)}>Book Now</button>
                        </div>
                        )
                      })}
                      </>
                      :
                      <>
                      {Flights.filter(Flight => Flight.origin === departure && Flight.destination === destination).map((Flight)=>{
                        return(

                        <div className="Flight">
                            <div>
                                <p> <b>{Flight.flightName}</b></p>
                                <p ><b>Flight Number:</b> {Flight.flightId}</p>
                            </div>
                            <div>
                                <p ><b>Start :</b> {Flight.origin}</p>
                                <p ><b>Departure Time:</b> {Flight.departureTime}</p>
                            </div>
                            <div>
                                <p ><b>Destination :</b> {Flight.destination}</p>
                                <p ><b>Arrival Time:</b> {Flight.arrivalTime}</p>
                            </div>
                            <div>
                                <p ><b>Starting Price:</b> {Flight.basePrice}</p>
                                <p ><b>Available Seats:</b> {Flight.totalSeats}</p>
                            </div>
                            <button className="button btn btn-primary" onClick={()=>handleTicketBooking(Flight._id, Flight.origin, Flight.destination)}>Book Now</button>
                        </div>
                        )
                      })}
                      </>}

                      

                    </div>
                  </div>
                  </>
                  :
                  <>
                   <div className="availableFlightsContainer">
                    <h1> No Flights</h1>
                    </div>
                  </>
                }
                </>
                :
                <></>
                }
         
                
                  
   






        </div>
        <section id="about" className="section-about  p-4">
        <div className="container">
            <h2 className="section-title">About MD Flights</h2>
            <p className="section-description">
                ✈️ Welcome to <b>MD Flights</b> – your gateway to the skies! We make flight booking effortless, fast, and enjoyable, so you can focus on what matters: your next adventure.
            </p>
            <p className="section-description">
                🌍 Whether you're planning a spontaneous getaway, a business trip, or a dream vacation, MD Flights brings you a world of destinations at your fingertips. Compare fares, discover the best deals, and book your seat in just a few clicks.
            </p>
            <p className="section-description">
                🛫 Experience a seamless journey from search to boarding. Our intuitive platform lets you customize your travel, manage bookings, and access exclusive offers – all in one place. With MD Flights, your journey begins the moment you start dreaming.
            </p>
            <p className="section-description">
                Ready to take off? Join thousands of happy travelers who trust MD Flights for their travel needs. Your next adventure is just a click away!
            </p>
            <div className="about-cards-grid">
                <div className="about-card card1">
                    <div className="about-card-top"><span role="img" aria-label="booking">🛫</span></div>
                    <div className="about-card-bottom">
                        <h4>Easy Booking</h4>
                        <p>Book your flights in just a few clicks with our user-friendly platform.</p>
                        <span className="about-card-label label1">Booking</span>
                    </div>
                </div>
                <div className="about-card card2">
                    <div className="about-card-top"><span role="img" aria-label="support">💬</span></div>
                    <div className="about-card-bottom">
                        <h4>24/7 Support</h4>
                        <p>Our support team is available around the clock to assist you on your journey.</p>
                        <span className="about-card-label label2">Support</span>
                    </div>
                </div>
                <div className="about-card card3">
                    <div className="about-card-top"><span role="img" aria-label="deals">💸</span></div>
                    <div className="about-card-bottom">
                        <h4>Best Deals</h4>
                        <p>Find the best fares and exclusive offers for your next adventure.</p>
                        <span className="about-card-label label3">Deals</span>
                    </div>
                </div>
                <div className="about-card card4">
                    <div className="about-card-top"><span role="img" aria-label="options">🛬</span></div>
                    <div className="about-card-bottom">
                        <h4>Flexible Options</h4>
                        <p>Choose from a variety of airlines, timings, and seat classes to suit your needs.</p>
                        <span className="about-card-label label4">Options</span>
                    </div>
                </div>
                <div className="about-card card5">
                    <div className="about-card-top"><span role="img" aria-label="secure">🔒</span></div>
                    <div className="about-card-bottom">
                        <h4>Secure Payments</h4>
                        <p>Enjoy safe and secure transactions with multiple payment options.</p>
                        <span className="about-card-label label5">Security</span>
                    </div>
                </div>
                <div className="about-card card6">
                    <div className="about-card-top"><span role="img" aria-label="updates">⏰</span></div>
                    <div className="about-card-bottom">
                        <h4>Real-Time Updates</h4>
                        <p>Get instant notifications about your flight status and schedule changes.</p>
                        <span className="about-card-label label6">Updates</span>
                    </div>
                </div>
                <div className="about-card card7">
                    <div className="about-card-top"><span role="img" aria-label="insights">🌍</span></div>
                    <div className="about-card-bottom">
                        <h4>Travel Insights</h4>
                        <p>Access tips and guides to make your air journey smoother and more enjoyable.</p>
                        <span className="about-card-label label7">Insights</span>
                    </div>
                </div>
                <div className="about-card card8">
                    <div className="about-card-top"><span role="img" aria-label="destinations">🗺️</span></div>
                    <div className="about-card-bottom">
                        <h4>Global Destinations</h4>
                        <p>Explore a wide network of destinations across the globe with MD Flights.</p>
                        <span className="about-card-label label8">Destinations</span>
                    </div>
                </div>
            </div>
            <span><h5>2020 MD FlightConnect - &copy; All rights reserved</h5></span>
        </div>
    </section>
    </div>
  )
}

export default LandingPage