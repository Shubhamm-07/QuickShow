import { clerkClient } from "@clerk/express";
import Booking from "../models/Booking.js"
import Show from "../models/Show.js";
import User from "../models/User.js";


const getUserDisplayName = (clerkUser) => {
    if (clerkUser.username) {
        return clerkUser.username;
    }

    const fullName = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim();
    if (fullName) {
        return fullName;
    }
    
    return clerkUser.emailAddresses?.[0]?.emailAddress || 'Unknown User';
};

// API to check if user is a admin
export const isAdmin = async (req, res) =>{
    res.json({success: true, isAdmin: true})
}

// API to get dashboard data
export const getDashboardData  = async (req, res) => {
    try {
        const bookings = await Booking.find({isPaid: true});
        const activeShows = await Show.find({showDateTime: {$gte: new Date()}}).
        populate('movie')

        const totalUser = await User.countDocuments();

        const dashboardData = {
            totalBookings: bookings.length,
            totalRevenue: bookings.reduce((acc, booking)=> acc + booking.amount, 0),
            activeShows,
            totalUser
        }

        res.json({success: true, dashboardData})
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all shows
export const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find({showDateTime: {$gte: new Date()}}).populate
        ('movie').sort({ showDateTime: 1})
        res.json({success: true, shows})

    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
    }
}

// API to get all bookings
export const getAllBookings = async (req, res) =>{
    try {
        const bookings = await Booking.find({}).populate('user').populate({
            path: "show",
            populate: {path: "movie"}
        }).sort({ createdAt: -1})
        res.json({success: true, bookings}) 
    } catch (error) {
        console.error(error);
        res.json({success: false, message: error.message})
        
    }

}
