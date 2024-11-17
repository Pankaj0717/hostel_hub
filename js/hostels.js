// Hostel management service
class HostelService {
  constructor() {
    this.hostels = JSON.parse(localStorage.getItem('hostels')) || [];
  }

  addHostel(hostelData) {
    const hostel = {
      ...hostelData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      bookings: []
    };
    
    this.hostels.push(hostel);
    this._saveHostels();
    return hostel;
  }

  deleteHostel(hostelId, ownerId) {
    const index = this.hostels.findIndex(h => h.id === hostelId && h.ownerId === ownerId);
    if (index !== -1) {
      this.hostels.splice(index, 1);
      this._saveHostels();
      return true;
    }
    return false;
  }

  getHostels() {
    return this.hostels;
  }

  getHostelsByOwner(ownerId) {
    return this.hostels.filter(h => h.ownerId === ownerId);
  }

  bookHostel(hostelId, userId, dates) {
    const hostel = this.hostels.find(h => h.id === hostelId);
    if (!hostel) throw new Error('Hostel not found');

    const booking = {
      id: Date.now().toString(),
      userId,
      hostelId,
      dates,
      status: 'pending'
    };

    hostel.bookings.push(booking);
    this._saveHostels();
    return booking;
  }

  _saveHostels() {
    localStorage.setItem('hostels', JSON.stringify(this.hostels));
  }
}

export const hostelService = new HostelService();