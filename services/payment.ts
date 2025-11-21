import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Payment, Subscription, UserPlan } from '../types';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_placeholder'); // Replace with actual key from env

export class PaymentService {
  private stripe: Promise<Stripe | null>;

  constructor() {
    this.stripe = stripePromise;
  }

  // Subscription Management
  async createSubscription(userId: string, plan: UserPlan): Promise<{ clientSecret: string }> {
    try {
      // In a real implementation, this would call your backend API
      // which would create a Stripe subscription and return the client secret
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan }),
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      const { clientSecret } = await response.json();
      return { clientSecret };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, newPlan: UserPlan): Promise<{ clientSecret: string }> {
    try {
      const response = await fetch('/api/update-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, newPlan }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      const { clientSecret } = await response.json();
      return { clientSecret };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Payment Processing
  async processPayment(clientSecret: string, paymentMethod?: any): Promise<{ paymentIntent: any }> {
    const stripe = await this.stripe;
    if (!stripe) {
      throw new Error('Stripe not initialized');
    }

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod,
    });

    if (error) {
      throw error;
    }

    return { paymentIntent };
  }



  // Billing History
  async getPaymentHistory(userId: string): Promise<Payment[]> {
    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(paymentsQuery);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Payment));
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Utility methods
  getPlanPrice(plan: UserPlan): number {
    switch (plan) {
      case 'premium': return 9.99;
      case 'blueberry': return 19.99;
      default: return 0;
    }
  }

  getPlanName(plan: UserPlan): string {
    switch (plan) {
      case 'free': return 'Free';
      case 'premium': return 'Premium';
      case 'blueberry': return 'Blueberry Ultra';
      default: return 'Unknown';
    }
  }
}

export const paymentService = new PaymentService();