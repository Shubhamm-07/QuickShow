import {Inngest} from 'inngest';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Show from '../models/Show.js';
import sendEmail from '../configs/nodeMailer.js';


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
    {event: 'clerk/user.deleted'},
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
)

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
)

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

// Inngest function to send email when user successfully books a show
const sendBookingConfirmationEmail = inngest.createFunction(
    {id: 'send-booking-confirmation-email'},
    {event: 'app/show.booked'},
    async({event, step}) =>{
        const {bookingId} = event.data;
        const booking = await Booking.findById(bookingId).populate
        ({
            path: 'show',
            populate: {path: 'movie', model: 'Movie'}
        }).populate('user');

        await sendEmail({
            to: booking.user.email,
            subject: `payment Confirmation: "${booking.show.movie.title}" booked!` ,
            body: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 30px 20px;
            border-radius: 8px 8px 0 0;
        }
        
        .content {
            background: #fff;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 0 0 8px 8px;
        }
        
        .booking-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .detail {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        
        .detail:last-child {
            border-bottom: none;
        }
        
        .label {
            font-weight: 600;
            color: #666;
        }
        
        .value {
            color: #333;
        }
        
        .price {
            font-size: 18px;
            font-weight: bold;
            color: #28a745;
        }
        
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            margin: 15px 5px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .detail {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎫 Booking Confirmed!</h1>
        <p>Your payment was successful</p>
    </div>
    
    <div class="content">
        <p>Hi <strong>${booking.user.name}</strong>,</p>
        
        <p>Your booking has been confirmed! Here are your ticket details:</p>
        
        <div class="booking-info">
            <div class="detail">
                <span class="label">Show:</span>
                <span class="value"><strong>${booking.show.movie.title}</strong></span>
            </div>
            
            <div class="detail">
                <span class="label">Date & Time:</span>
                <span class="value">${new Date(booking.show.showDateTime).toLocaleDateString('en-US',{ timeZone: 'Asia/Kolkata'})} at
                ${new Date(booking.show.showDateTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata'})}</span>
            </div>
        </div>
        
        <p><strong>Important:</strong> Please arrive 30 minutes early and bring a valid ID.</p>
        
        <p>Thanks for booking with us!</p>
    </div>
    
    <div class="footer">
        <p> Quick Show | support@quickShow.com | +91 1234567890 </p>
    </div>
</body>
</html>`
        })
    }
)

// Inngest function to send reminders
const sendShowReminders = inngest.createFunction(
    {id: 'send-show-reminders'},
    {cron: '0 */8 * * *' }, // every 8 hrs.
    async({step})=>{
        const now = new Date();
        const in8hours = new Date(now.getTime + 8*60*60*1000);
        const windowStart = new Date(in8hours.getTime() - 10*60*1000)

        // Prepare reminder tasks
        const reminderTasks = await step.run
            ('prepare-reminder-tasks', async ()=>{
                const shows = await Show.find({
                    showTime: { $gte: windowStart, $lte: in8Hours},
                }).populate('movie');
                
                const tasks = [];

                for(const show of shows){
                    if(!show.movie || !show.occupiedSeats) continue;

                    const userIds = [...new Set(Object.values(show.occupiedSeats))]
                    if(userIds.length === 0) continue;

                    const users = await User.find({_id: {$in: userIds}}).select('name email');

                    for(const user of users){
                        tasks.push({
                            userEmail: user.email,
                            userName: user.name,
                            showTime: show.showTime,
                        })
                    }
                }
                return tasks;   
            })

            if(reminderTasksTasks.length === 0){
                return {sent: 0, message: 'No reminders to send.'}
            }

            // Send reminder emails
            const results = await step.run('send-all-reminders', async ()=>{
                return await Promise.allSettled(
                    reminderTasks.map(task => sendEmail({
                        to: task.userEmail,
                        subject: `Reminder: Your movie "${task.movieTitle}" starts soon!`,
                        body:`<div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: #e74c3c; color: white; text-align: center; padding: 25px;">
    <h1 style="margin: 0; font-size: 24px;">🍿 Movie Reminder</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Your show is coming up!</p>
  </div>

  <!-- Content -->
  <div style="padding: 25px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi <strong>${task.userName}</strong>,</p>
    
    <!-- Movie Info -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 15px 0;">
      <h2 style="color: #e74c3c; margin: 0 0 15px 0; font-size: 20px;">${task.movieTitle}</h2>
      
      <p style="margin: 8px 0; color: #333;"><strong>📅 Date:</strong>${new Date(task.show.showTime).toLocaleDateString('en-US',{ timeZone: 'Asia/Kolkata'})} </p>
      <p style="margin: 8px 0; color: #333;"><strong>⏰ Time:</strong>${new Date(task.show.showDateTime).toLocaleTimeString('en-US', {timeZone: 'Asia/Kolkata'})}</p>
  </div>

    <p style="margin: 15px 0 0 0; color: #666; font-size: 14px; text-align: center;">
      Arrive 15 minutes early • Bring valid ID<br>
      quickShow | quickShow@gmail.com
    </p>
  </div>
</div>`
                    }))
                )
           })

           const sent = results.filter(r => r.status === 'fulfilled').length;
           const failed = results.length - sent;
           
           return {
            sent,
            failed,
            message: `Sent ${sent} reminder(s), ${failed} failed.`
           }
    }
)  


// Inngest function to send new show notifications
const  sendNewShowNotifications = inngest.createFunction(
    {id: 'send-new-show-notifications'},
    {event: 'app/show.added'},
    async ({ event }) =>{
        const { movieTitle} = event.data;

        const users = await User.find({})

        for(const user of users){
            const userEmail = user.email;
            const userName = user.name;

            const subject = `🎬 New Show Added ${movieTitle}`;
            const body = `<div style="max-width: 500px; margin: 0 auto; font-family: Arial, sans-serif; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: #3498db; color: white; text-align: center; padding: 25px;">
    <h1 style="margin: 0; font-size: 24px;">🎬 New Shows For You</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Don't miss these amazing shows!</p>
  </div>

  <!-- Content -->
  <div style="padding: 25px;">
    <p style="margin: 0 0 20px 0; font-size: 16px;">Hi <strong>${userName}</strong>,</p>
    
    <p style="margin: 0 0 20px 0; color: #555;">Check out these exciting shows now playing:</p>
    
    <!-- Show Recommendations -->
    <div style="background: #f8f9fa; padding: 20px; border-radius: 6px; margin: 15px 0;">
      <h2 style="color: #3498db; margin: 0 0 15px 0; font-size: 20px;">${movieTitle}</h2>
    </div>

    <p style="margin: 15px 0 0 0; color: #666; font-size: 14px; text-align: center;">
      Book early for best seats • Easy cancellation<br>
      QuickShow | quickShow@gmail.com
    </p>
  </div>
</div>`;
            await sendEmail({
              to: userEmail,
              subject, 
              body,
            })
        }

        return {message: 'Notifications sent.'}
    }
)



export const functions = [
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    releaseSeatsAndDeleteBooking,
    sendBookingConfirmationEmail,
    sendShowReminders,
    sendNewShowNotifications
];