import {Inngest} from 'inngest';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';

// Create a client to send and receive events
export const inngest = new Inngest({id: "movie-ticket-booking" });

// FIXED: Inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
    {id: 'sync-user-from-clerk'},
    { event: 'clerk/user.created'},
    async ({event}) => {
        console.log("🔥 Function triggered!", event.data);
    
        try {
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            
            const userData = {
                _id: id, // FIXED: Use _id instead of _id
                email: email_addresses[0].email_address,
                name: (first_name || '') + ' ' + (last_name || ''),
                image: image_url
            };
            
            console.log("💾 About to save user...", userData);
            const savedUser = await User.create(userData); // FIXED: Only one User.create() call
            console.log("✅ User saved successfully:", savedUser);
            
        } catch (error) {
            console.error("❌ Database error:", error);
            throw error; // Re-throw so Inngest can retry
        }
    }
);

// FIXED: Inngest function to delete user from database
const syncUserDeletion = inngest.createFunction(
    {id: 'delete-user-with-clerk'},
    { event: 'clerk/user.deleted'},
    async ({event}) => {
        try {
            console.log("🗑️ Clerk deletion event received:", event.data);
            
            const {id} = event.data;
            const deletedUser = await User.findOneAndDelete({_id: id}); // FIXED: Use _id
            
            if (deletedUser) {
                console.log("✅ User deleted successfully:", deletedUser._id);
            } else {
                console.log("⚠️ User not found for deletion:", id);
            }
            
        } catch (error) {
            console.error("❌ Deletion error:", error);
            throw error;
        }
    }
);

// FIXED: Inngest function to update user in database  
const syncUserUpdation = inngest.createFunction(
    {id: 'update-user-from-clerk'},
    { event: 'clerk/user.updated'},
    async ({event}) => {
        try {
            console.log("📝 Clerk update event received:", event.data);
            
            const {id, first_name, last_name, email_addresses, image_url} = event.data;
            
            const userData = {
                email: email_addresses[0].email_address,
                name: (first_name || '') + ' ' + (last_name || ''),
                image: image_url,
                updatedAt: new Date()
            };
            
            const updatedUser = await User.findOneAndUpdate(
                {_id: id}, // FIXED: Use _id instead of _id
                userData,
                {new: true}
            );
            
            if (updatedUser) {
                console.log("✅ User updated successfully:", updatedUser._id);
            } else {
                console.log("⚠️ User not found for update:", id);
            }
            
        } catch (error) {
            console.error("❌ Update error:", error);
            throw error;
        }
    }
);

// Inngest Funtion to cancel booking and release seats of show after 10 minutes of booking created if payment is not made
const releaseSeatsAndDeleteBooking = inngest.createFunction(
    {id: 'release-seats-delete-booking'},
    {event: 'app/checkpayment'},
    async ({event, step}) =>{
        const tenMinutesLater = new Date(Date.now() + 5*60*1000)
        await step.sleepUntil('wait-for-10-minutes', tenMinutesLater);

        await step.run('check-payment-status', async()=>{
            const bookingId = event.data.bookingId;
            const booking = await Booking.findById(bookingId)

            //  if payment is not made, release seats and delete booking
            if(!booking.isPaid){
                const show = await Show.findById(booking.show);
                booking.bookedSeats.forEach((seat)=>{
                    delete show.occupiedSeats[seat]
                });
                show.markModified('occupiedSeats')
                await show.save()
                await Booking.findByIdAndDelete(booking._id)
            }
        })
    }
)

export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation
];