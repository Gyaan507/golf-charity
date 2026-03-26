
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
    try {
        // 2. Call the Stripe API to create a checkout page
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'subscription', 
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'Golf Charity Monthly Subscription',
                        },
                        unit_amount: 1000, // Stripe uses cents! 1000 = $10.00
                        recurring: { interval: 'month' }
                    },
                    quantity: 1,
                },
            ],
            // 3. Where should Stripe send the user after they pay?
           success_url: 'https://golf-charity-phi.vercel.app/success',
            cancel_url: 'https://golf-charity-phi.vercel.app/cancel',
        });

        // 4. Send the generated Stripe URL back to the frontend
        res.status(200).json({ url: session.url });
        
    } catch (error) {
        console.error('Stripe API Error:', error);
        res.status(500).json({ error: 'Failed to connect to payment gateway' });
    }
};

module.exports = { createCheckoutSession };