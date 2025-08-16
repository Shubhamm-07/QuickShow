import stripe from 'stripe';
import Booking from '../models/Booking.js'

export const stripeWebhooks = async (request, response) =>{

   console.log('🔍 DETAILED DEBUG:');
    console.log('Body is Buffer:', Buffer.isBuffer(request.body));
    console.log('Body constructor:', request.body?.constructor.name);
    console.log('Body first 100 chars:', request.body?.toString().substring(0, 100));
    console.log('Signature header full value:', request.headers['stripe-signature']);
    
    const stripeInstance =  new stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"];

    let event;

    try{
        event = stripeInstance.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch(error){
        return response.status(400).send(`Webhook Error: ${error.message}`)
    }

   try {
        switch (event.type) {
            case "checkout.session.completed": { // MAIN FIX: Changed from payment_intent.succeeded
                console.log('💳 Processing checkout session completed');
                
                const session = event.data.object;
                console.log('Session ID:', session.id);
                console.log('Payment Status:', session.payment_status);
                console.log('Metadata:', session.metadata);
                
                const { bookingId } = session.metadata;
                
                if (!bookingId) {
                    console.error('❌ No booking ID found in metadata');
                    break;
                }
                
                console.log('🎫 Updating booking:', bookingId);
                
                const updatedBooking = await Booking.findByIdAndUpdate(bookingId, {
                    isPaid: true,
                    paymentId: session.payment_intent || session.id, // Store payment reference
                    paymentLink: session.url || "" // Keep the payment link for reference
                }, { new: true }); // Return updated document
                
                if (updatedBooking) {
                    console.log(`✅ Booking ${bookingId} successfully marked as paid!`);
                } else {
                    console.error(`❌ Booking ${bookingId} not found in database`);
                }
                
                break;
            }
            
            case "payment_intent.succeeded": { // Keep this as backup
                console.log('💰 Processing payment intent succeeded');
                
                const paymentIntent = event.data.object;
                const sessionList = await stripeInstance.checkout.sessions.list({
                    payment_intent: paymentIntent.id
                });
                 
                const session = sessionList.data[0];
                if (session && session.metadata) {
                    const { bookingId } = session.metadata;
                    
                    if (bookingId) {
                        await Booking.findByIdAndUpdate(bookingId, {
                            isPaid: true,
                            paymentId: paymentIntent.id,
                            paymentLink: ""
                        });
                        
                        console.log(`✅ Booking ${bookingId} marked as paid via payment_intent`);
                    }
                }
                break;
            }
                        
            default:
                console.log('ℹ️ Unhandled event type:', event.type)
        }
        
        response.json({ received: true })
        
    } catch (err) {
        console.error("❌ Webhook processing error:", err);
        response.status(500).send("Internal Server error");                      
    }
}