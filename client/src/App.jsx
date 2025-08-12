import React from "react";
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import {Route, Routes, useLocation } from "react-router-dom";
import Bookings from "./pages/myBookings";
import SeatLayout from "./pages/seatLayout";
import MovieDetail from "./pages/MovieDetail";
import Movies from "./pages/movies";
import Favourite from "./pages/favourite";
import Home from "./pages/Home";
import {Toaster} from "react-hot-toast"
import Layout from "./pages/admin/Layout";
import Dashboard from "./pages/admin/Dashboard";
import AddShows from "./pages/admin/AddShows";
import ListShows from "./pages/admin/ListShows";
import ListBookings from "./pages/admin/ListBookings";

const App = () =>{
  const isAdminRoute = useLocation().pathname.startsWith('/admin')
  return (
    <>
    <Toaster/>
     {!isAdminRoute && <Navbar/>}
     <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/movies' element={<Movies/>} />
      <Route path='/movies/:id' element={<MovieDetail/>} />
      <Route path='/movies/:id/:date' element={<SeatLayout/>}/>
      <Route path='/Favourite' element={<Favourite/>}/>
      <Route path='/my-bookings' element={<Bookings/>}/>
      <Route path='/admin/*' element={<Layout/>}>
        <Route index element={<Dashboard/>}/>
        <Route path="add-shows" element={<AddShows/>}/>
        <Route path="list-shows" element={<ListShows/>}/>
        <Route path="list-bookings" element={<ListBookings/>}/>

      </Route>
     </Routes>
     {!isAdminRoute && <Footer/>}
    </>
  );
};
export default App;