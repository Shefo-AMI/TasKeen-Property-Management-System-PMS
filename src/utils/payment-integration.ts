// Payment Integration for Stripe and PayPal
// This file handles subscription payments and webhook processing

import { supabase } from './supabase/client';
import { profileService, subscriptionService } from './taskeen-services';

/**
 * Stripe Integration
 */
export const stripeConfig = {
  publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE',
  proPriceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
  webhookSecret: import.meta.env.VITE_STRIPE_WEBHOOK_SECRET || '',
};

export async function createStripeCheckout(userId: string, email: string) {
  try {
    // In production, this would call your backend endpoint
    // For now, we'll simulate the flow
    
    const checkoutUrl = `https://checkout.stripe.com/c/pay/${stripeConfig.proPriceId}`;
    
    // Store pending subscription intent
    localStorage.setItem('pending_subscription', JSON.stringify({
      provider: 'stripe',
      userId,
      email,
      timestamp: Date.now(),
    }));

    return {
      url: checkoutUrl,
      sessionId: `cs_${Date.now()}`,
    };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw new Error('Failed to create Stripe checkout session');
  }
}

export async function handleStripeWebhook(event: any) {
  const { type, data } = event;

  switch (type) {
    case 'checkout.session.completed':
      await handleSuccessfulPayment(data.object, 'stripe');
      break;
    
    case 'customer.subscription.updated':
      await handleSubscriptionUpdate(data.object, 'stripe');
      break;
    
    case 'customer.subscription.deleted':
      await handleSubscriptionCancellation(data.object, 'stripe');
      break;
    
    case 'invoice.payment_failed':
      await handlePaymentFailure(data.object, 'stripe');
      break;
  }
}

/**
 * PayPal Integration
 */
export const paypalConfig = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || 'YOUR_PAYPAL_CLIENT_ID',
  planId: import.meta.env.VITE_PAYPAL_PRO_PLAN_ID || 'P-XXXXXXXXXXXXX',
  mode: import.meta.env.VITE_PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
};

export async function createPayPalSubscription(userId: string, email: string) {
  try {
    // In production, this would use PayPal SDK
    // For now, we'll simulate the flow
    
    const subscriptionUrl = `https://www.${paypalConfig.mode}.paypal.com/subscribe`;
    
    // Store pending subscription intent
    localStorage.setItem('pending_subscription', JSON.stringify({
      provider: 'paypal',
      userId,
      email,
      timestamp: Date.now(),
    }));

    return {
      url: subscriptionUrl,
      subscriptionId: `I-${Date.now()}`,
    };
  } catch (error) {
    console.error('PayPal subscription error:', error);
    throw new Error('Failed to create PayPal subscription');
  }
}

export async function handlePayPalWebhook(event: any) {
  const { event_type, resource } = event;

  switch (event_type) {
    case 'BILLING.SUBSCRIPTION.ACTIVATED':
      await handleSuccessfulPayment(resource, 'paypal');
      break;
    
    case 'BILLING.SUBSCRIPTION.UPDATED':
      await handleSubscriptionUpdate(resource, 'paypal');
      break;
    
    case 'BILLING.SUBSCRIPTION.CANCELLED':
      await handleSubscriptionCancellation(resource, 'paypal');
      break;
    
    case 'PAYMENT.SALE.COMPLETED':
      await handlePaymentSuccess(resource, 'paypal');
      break;
    
    case 'PAYMENT.SALE.FAILED':
      await handlePaymentFailure(resource, 'paypal');
      break;
  }
}

/**
 * Common Payment Handlers
 */
async function handleSuccessfulPayment(data: any, provider: 'stripe' | 'paypal') {
  try {
    // Extract customer info
    const customerId = provider === 'stripe' ? data.customer : data.subscriber?.email_address;
    const subscriptionId = provider === 'stripe' ? data.subscription : data.id;

    // Get user from pending subscription or email
    const pending = localStorage.getItem('pending_subscription');
    let userId: string | null = null;

    if (pending) {
      const { userId: pendingUserId } = JSON.parse(pending);
      userId = pendingUserId;
      localStorage.removeItem('pending_subscription');
    }

    if (!userId) {
      // Try to find user by email from webhook data
      const email = provider === 'stripe' ? data.customer_email : data.subscriber?.email_address;
      if (email) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('id')
          .eq('email', email)
          .single();
        
        if (profile) {
          userId = profile.id;
        }
      }
    }

    if (!userId) {
      console.error('Could not determine user ID from payment');
      return;
    }

    // Create subscription record
    await subscriptionService.create({
      user_id: userId,
      plan_type: 'pro',
      status: 'active',
      payment_provider: provider,
      external_subscription_id: subscriptionId,
      amount: 15,
      currency: 'USD',
      billing_period: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    });

    // Update customer profile to Pro
    await supabase
      .from('customer_profiles')
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
        subscription_id: subscriptionId,
        ...(provider === 'stripe' ? { stripe_customer_id: customerId } : { paypal_subscription_id: subscriptionId }),
      })
      .eq('id', userId);

    console.log(`✅ User ${userId} upgraded to Pro via ${provider}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(data: any, provider: 'stripe' | 'paypal') {
  try {
    const subscriptionId = provider === 'stripe' ? data.id : data.id;
    const status = provider === 'stripe' ? data.status : data.status;

    // Update subscription in database
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('external_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      await subscriptionService.update(subscription.id, {
        status: mapSubscriptionStatus(status),
      });
    }

    console.log(`✅ Subscription ${subscriptionId} updated`);
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionCancellation(data: any, provider: 'stripe' | 'paypal') {
  try {
    const subscriptionId = provider === 'stripe' ? data.id : data.id;

    // Find and update subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, id')
      .eq('external_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      // Update subscription status
      await subscriptionService.update(subscription.id, {
        status: 'cancelled',
        cancel_at_period_end: true,
      });

      // Update customer profile back to free (at period end)
      // In practice, you'd wait until the period actually ends
      await supabase
        .from('customer_profiles')
        .update({
          plan_type: 'free',
          subscription_status: 'cancelled',
        })
        .eq('id', subscription.user_id);
    }

    console.log(`✅ Subscription ${subscriptionId} cancelled`);
  } catch (error) {
    console.error('Error handling subscription cancellation:', error);
  }
}

async function handlePaymentSuccess(data: any, provider: 'stripe' | 'paypal') {
  console.log(`✅ Payment successful via ${provider}`);
  // Additional payment success logic here
}

async function handlePaymentFailure(data: any, provider: 'stripe' | 'paypal') {
  try {
    const subscriptionId = provider === 'stripe' ? data.subscription : data.billing_agreement_id;

    // Find and update subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('user_id, id')
      .eq('external_subscription_id', subscriptionId)
      .single();

    if (subscription) {
      // Update subscription status to past_due
      await subscriptionService.update(subscription.id, {
        status: 'past_due',
      });

      // Update customer profile
      await supabase
        .from('customer_profiles')
        .update({
          subscription_status: 'past_due',
        })
        .eq('id', subscription.user_id);
    }

    console.log(`⚠️ Payment failed for subscription ${subscriptionId}`);
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
}

function mapSubscriptionStatus(status: string): 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing' {
  const statusMap: Record<string, any> = {
    'active': 'active',
    'trialing': 'trialing',
    'past_due': 'past_due',
    'canceled': 'cancelled',
    'cancelled': 'cancelled',
    'unpaid': 'past_due',
    'incomplete': 'inactive',
    'ACTIVE': 'active',
    'SUSPENDED': 'past_due',
    'CANCELLED': 'cancelled',
  };

  return statusMap[status] || 'inactive';
}

/**
 * Mock payment for development/testing
 */
export async function mockProUpgrade(userId: string) {
  try {
    // Create a mock subscription
    await subscriptionService.create({
      user_id: userId,
      plan_type: 'pro',
      status: 'active',
      payment_provider: 'stripe',
      external_subscription_id: `mock_${Date.now()}`,
      amount: 15,
      currency: 'USD',
      billing_period: 'monthly',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
    });

    // Update profile to Pro
    await supabase
      .from('customer_profiles')
      .update({
        plan_type: 'pro',
        subscription_status: 'active',
        subscription_id: `mock_${Date.now()}`,
      })
      .eq('id', userId);

    return { success: true };
  } catch (error) {
    console.error('Mock upgrade error:', error);
    throw error;
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, provider: 'stripe' | 'paypal') {
  try {
    // In production, this would call the payment provider's API
    // For now, just update our database
    
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .single();

    if (subscription) {
      await subscriptionService.cancel(subscriptionId);
      
      // Update profile
      await supabase
        .from('customer_profiles')
        .update({
          subscription_status: 'cancelled',
        })
        .eq('id', subscription.user_id);
    }

    return { success: true };
  } catch (error) {
    console.error('Cancel subscription error:', error);
    throw error;
  }
}

/**
 * Get checkout URL for manual testing
 */
export function getCheckoutURL(provider: 'stripe' | 'paypal') {
  if (provider === 'stripe') {
    return `https://buy.stripe.com/test_XXXXXXXX`; // Replace with your actual Stripe payment link
  } else {
    return `https://www.paypal.com/webapps/billing/plans/subscribe?plan_id=${paypalConfig.planId}`;
  }
}
