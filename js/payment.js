// Payment processing service
class PaymentService {
  constructor() {
    this.payments = JSON.parse(localStorage.getItem('payments')) || [];
  }

  processPayment(bookingData) {
    return new Promise((resolve, reject) => {
      // Simulate payment processing
      setTimeout(() => {
        const payment = {
          id: Date.now().toString(),
          bookingId: bookingData.bookingId,
          amount: bookingData.amount,
          status: 'success',
          timestamp: new Date().toISOString()
        };

        this.payments.push(payment);
        localStorage.setItem('payments', JSON.stringify(this.payments));
        resolve(payment);
      }, 1500); // Simulate network delay
    });
  }

  getPaymentsByBooking(bookingId) {
    return this.payments.filter(p => p.bookingId === bookingId);
  }
}

export const paymentService = new PaymentService();