import { authService } from './auth.js';
import { hostelService } from './hostels.js';
import { paymentService } from './payment.js';
import { showMessage } from './ui.js';

export function initializeDashboard() {
  const user = authService.getCurrentUser();
  if (!user) return;

  const mainContent = document.querySelector('main');
  
  if (user.userType === 'owner') {
    showOwnerDashboard(mainContent, user);
  } else {
    showStudentDashboard(mainContent);
  }
}

function showOwnerDashboard(container, user) {
  container.innerHTML = `
    <div class="dashboard">
      <h2>Hostel Management</h2>
      <button id="addHostelBtn" class="primary">Add New Hostel</button>
      
      <form id="addHostelForm" class="hidden">
        <div class="form-group">
          <input type="text" name="name" placeholder="Hostel Name" required>
        </div>
        <div class="form-group">
          <input type="text" name="location" placeholder="Location" required>
        </div>
        <div class="form-group">
          <input type="number" name="price" placeholder="Price per night" required>
        </div>
        <div class="form-group">
          <textarea name="description" placeholder="Description" required></textarea>
        </div>
        <button type="submit" class="primary">Add Hostel</button>
      </form>

      <div id="hostelsList" class="hostels-grid"></div>
    </div>
  `;

  // Show owner's hostels
  displayOwnerHostels(user.id);

  // Add hostel form handling
  const addHostelBtn = document.getElementById('addHostelBtn');
  const addHostelForm = document.getElementById('addHostelForm');

  addHostelBtn.addEventListener('click', () => {
    addHostelForm.classList.toggle('hidden');
  });

  addHostelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(addHostelForm);
    
    const hostelData = {
      name: formData.get('name'),
      location: formData.get('location'),
      price: Number(formData.get('price')),
      description: formData.get('description'),
      ownerId: user.id
    };

    hostelService.addHostel(hostelData);
    showMessage('Hostel added successfully!', 'success');
    addHostelForm.reset();
    addHostelForm.classList.add('hidden');
    displayOwnerHostels(user.id);
  });
}

function showStudentDashboard(container) {
  container.innerHTML = `
    <div class="dashboard">
      <h2>Available Hostels</h2>
      <div class="search-filters">
        <input type="text" id="searchLocation" placeholder="Search by location">
        <input type="number" id="priceFilter" placeholder="Max price">
        <button id="filterBtn" class="primary">Filter</button>
      </div>
      <div id="hostelsList" class="hostels-grid"></div>
    </div>
  `;

  displayAllHostels();

  // Implement search and filter functionality
  const filterBtn = document.getElementById('filterBtn');
  filterBtn.addEventListener('click', () => {
    const location = document.getElementById('searchLocation').value.toLowerCase();
    const maxPrice = document.getElementById('priceFilter').value;
    
    const hostels = hostelService.getHostels().filter(hostel => {
      const matchesLocation = !location || hostel.location.toLowerCase().includes(location);
      const matchesPrice = !maxPrice || hostel.price <= maxPrice;
      return matchesLocation && matchesPrice;
    });

    displayHostels(hostels);
  });
}

function displayOwnerHostels(ownerId) {
  const hostels = hostelService.getHostelsByOwner(ownerId);
  displayHostels(hostels, true);
}

function displayAllHostels() {
  const hostels = hostelService.getHostels();
  displayHostels(hostels, false);
}

function displayHostels(hostels, isOwner = false) {
  const hostelsList = document.getElementById('hostelsList');
  hostelsList.innerHTML = hostels.map(hostel => `
    <div class="hostel-card">
      <h3>${hostel.name}</h3>
      <p class="location">${hostel.location}</p>
      <p class="price">₹${hostel.price} per night</p>
      <p class="description">${hostel.description}</p>
      ${isOwner 
        ? `<button class="delete-hostel" data-id="${hostel.id}">Delete</button>`
        : `<button class="book-hostel primary" data-id="${hostel.id}" data-price="${hostel.price}">Book Now</button>`
      }
    </div>
  `).join('');

  // Add event listeners
  if (isOwner) {
    hostelsList.querySelectorAll('.delete-hostel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hostelId = e.target.dataset.id;
        if (hostelService.deleteHostel(hostelId, ownerId)) {
          showMessage('Hostel deleted successfully', 'success');
          displayOwnerHostels(ownerId);
        }
      });
    });
  } else {
    hostelsList.querySelectorAll('.book-hostel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const hostelId = e.target.dataset.id;
        const pricePerNight = parseFloat(e.target.dataset.price);
        showBookingModal(hostelId, pricePerNight);
      });
    });
  }
}

function showBookingModal(hostelId, pricePerNight) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.display = 'flex';
  
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2>Book Hostel</h2>
      <form id="bookingForm">
        <div class="form-group">
          <label>Check-in Date</label>
          <input type="date" name="checkIn" required min="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label>Check-out Date</label>
          <input type="date" name="checkOut" required>
        </div>
        <div class="form-group">
          <p>Price per night: ₹${pricePerNight}</p>
          <p id="totalPrice">Total price: ₹0</p>
        </div>
        <button type="submit" class="primary">Proceed to Payment</button>
      </form>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', () => modal.remove());

  // Calculate total price when dates change
  const checkInInput = modal.querySelector('input[name="checkIn"]');
  const checkOutInput = modal.querySelector('input[name="checkOut"]');
  const totalPriceElement = modal.querySelector('#totalPrice');

  function updateTotalPrice() {
    const checkIn = new Date(checkInInput.value);
    const checkOut = new Date(checkOutInput.value);
    if (checkIn && checkOut && checkOut > checkIn) {
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const total = nights * pricePerNight;
      totalPriceElement.textContent = `Total price: ₹${total}`;
      return total;
    }
    return 0;
  }

  checkInInput.addEventListener('change', updateTotalPrice);
  checkOutInput.addEventListener('change', updateTotalPrice);

  const bookingForm = modal.querySelector('#bookingForm');
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(bookingForm);
    const user = authService.getCurrentUser();
    const totalAmount = updateTotalPrice();

    if (totalAmount === 0) {
      showMessage('Please select valid dates');
      return;
    }

    // Show payment modal
    showPaymentModal(modal, {
      hostelId,
      userId: user.id,
      checkIn: formData.get('checkIn'),
      checkOut: formData.get('checkOut'),
      amount: totalAmount
    });
  });
}

function showPaymentModal(bookingModal, bookingData) {
  const paymentModal = document.createElement('div');
  paymentModal.className = 'modal payment-modal';
  paymentModal.style.display = 'flex';

  paymentModal.innerHTML = `
    <div class="modal-content">
      <h2>Payment Details</h2>
      <div class="payment-summary">
        <p>Total Amount: ₹${bookingData.amount}</p>
      </div>
      <form id="paymentForm">
        <div class="form-group">
          <label>Card Number</label>
          <input type="text" pattern="[0-9]{16}" placeholder="1234 5678 9012 3456" required>
        </div>
        <div class="form-group">
          <label>Expiry Date</label>
          <input type="text" pattern="(0[1-9]|1[0-2])\/([0-9]{2})" placeholder="MM/YY" required>
        </div>
        <div class="form-group">
          <label>CVV</label>
          <input type="text" pattern="[0-9]{3}" placeholder="123" required>
        </div>
        <button type="submit" class="primary">Pay Now</button>
      </form>
    </div>
  `;

  document.body.appendChild(paymentModal);

  const paymentForm = paymentModal.querySelector('#paymentForm');
  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = paymentForm.querySelector('button');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';

    try {
      // Create booking first
      const booking = hostelService.bookHostel(bookingData.hostelId, bookingData.userId, {
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut
      });

      // Process payment
      await paymentService.processPayment({
        bookingId: booking.id,
        amount: bookingData.amount
      });

      showMessage('Payment successful! Booking confirmed.', 'success');
      paymentModal.remove();
      bookingModal.remove();
    } catch (error) {
      showMessage(error.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    }
  });
}