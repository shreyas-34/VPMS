const apiUrlVehicles = 'http://localhost:3000/vehicles';
const apiUrlUsers = 'http://localhost:3000/users';
const apiUrlSlots = 'http://localhost:3000/parking_slots';
const apiUrlReservations = 'http://localhost:3000/reservations';
const apiUrlParkingLots = 'http://localhost:3000/parking_lots';
const apiUrlPayments = 'http://localhost:3000/payments';

window.addEventListener('DOMContentLoaded', () => {
  // Initial loads for pages that have these elements
  if (document.getElementById('user-list') || document.getElementById('user_id')) {
    loadUsers();
  }
  if (document.getElementById('vehicle-list') || document.getElementById('vehicle_number')) {
    loadVehicles();
  }
  if (document.getElementById('reservation_user_id') && document.getElementById('reservation_slot_id')) {
    loadUsersForReservation();
    loadSlotsForReservation();
    loadReservations();
  }
  if (document.getElementById('parking-lot-list')) {
    loadParkingLots();
  }
  if (document.getElementById('paymentsTable')) {
    fetchPayments();
  }

  // Setup event listeners
  const reservationForm = document.getElementById('reservation-form');
  if (reservationForm) {
    reservationForm.addEventListener('submit', handleReservationSubmit);
  }

  const parkingLotForm = document.getElementById('parking-lot-form');
  const cancelEditBtn = document.getElementById('cancel-edit');
  if (parkingLotForm) {
    parkingLotForm.addEventListener('submit', handleParkingLotSubmit);
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      resetParkingLotForm();
    });
  }

  const addVehicleBtn = document.getElementById('add-vehicle-btn');
  if (addVehicleBtn) {
    addVehicleBtn.addEventListener('click', addVehicle);
  }

  const registerUserBtn = document.getElementById('register-user-btn');
  if (registerUserBtn) {
    registerUserBtn.addEventListener('click', registerUser);
  }

  const paymentForm = document.getElementById('paymentForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handlePaymentSubmit);
  }
});

// ========== VEHICLES ==========

async function loadVehicles() {
  const list = document.getElementById('vehicle-list');
  if (!list) return;

  try {
    const res = await fetch(apiUrlVehicles);
    const data = await res.json();
    list.innerHTML = '';
    data.forEach(vehicle => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${vehicle.vehicle_id}</td>
        <td>${vehicle.user_id}</td>
        <td>${vehicle.vehicle_number}</td>
        <td>${vehicle.vehicle_type}</td>
        <td>${vehicle.registered_at || ''}</td>
        <td><button onclick="deleteVehicle(${vehicle.vehicle_id})">Delete</button></td>
      `;
      list.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading vehicles:', err);
    alert('Failed to load vehicles');
  }
}

async function addVehicle() {
  const user_id = document.getElementById('user_id')?.value;
  const vehicle_number = document.getElementById('vehicle_number')?.value.trim();
  const vehicle_type = document.getElementById('vehicle_type')?.value;

  if (!user_id) {
    alert("Please select a user.");
    return;
  }
  if (!vehicle_number) {
    alert("Please enter vehicle number.");
    return;
  }

  try {
    const res = await fetch(apiUrlVehicles, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, vehicle_number, vehicle_type })
    });
    const data = await res.json();
    alert('Vehicle added successfully');
    // Reset fields
    if(document.getElementById('vehicle_number')) document.getElementById('vehicle_number').value = '';
    if(document.getElementById('vehicle_type')) document.getElementById('vehicle_type').value = 'car';
    loadVehicles();
  } catch (error) {
    console.error('Error adding vehicle:', error);
    alert('Failed to add vehicle');
  }
}

async function deleteVehicle(id) {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;

  try {
    const res = await fetch(`${apiUrlVehicles}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || 'Vehicle deleted');
    loadVehicles();
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    alert('Failed to delete vehicle');
  }
}

// ========== USERS ==========

async function loadUsers() {
  const userSelect = document.getElementById('user_id');
  const userList = document.getElementById('user-list');

  if (!userSelect && !userList) return;

  try {
    const res = await fetch(apiUrlUsers);
    const data = await res.json();

    if (userSelect) {
      userSelect.innerHTML = '<option value="">Select User</option>';
      data.forEach(user => {
        const option = document.createElement('option');
        option.value = user.user_id;
        option.textContent = `${user.name} (ID: ${user.user_id})`;
        userSelect.appendChild(option);
      });
    }

    if (userList) {
      userList.innerHTML = '';
      data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.user_id}</td>
          <td>${user.name}</td>
          <td><button onclick="deleteUser(${user.user_id})">Delete</button></td>
        `;
        userList.appendChild(row);
      });
    }
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Failed to load users');
  }
}

async function registerUser() {
  const name = document.getElementById('new_name')?.value.trim();
  const email = document.getElementById('new_email')?.value.trim();
  const password = document.getElementById('new_password')?.value;
  const phone = document.getElementById('new_phone')?.value.trim();
  const role = document.getElementById('new_role')?.value;

  if (!name || !email || !password || !phone) {
    alert('Please fill all required user fields');
    return;
  }

  try {
    const res = await fetch(apiUrlUsers, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone, role })
    });
    const data = await res.json();
    alert(`User registered with ID: ${data.id || data.user_id}`);
    // Clear inputs
    if(document.getElementById('new_name')) document.getElementById('new_name').value = '';
    if(document.getElementById('new_email')) document.getElementById('new_email').value = '';
    if(document.getElementById('new_password')) document.getElementById('new_password').value = '';
    if(document.getElementById('new_phone')) document.getElementById('new_phone').value = '';
    if(document.getElementById('new_role')) document.getElementById('new_role').value = 'user';
    loadUsers();
  } catch (error) {
    console.error('Error registering user:', error);
    alert('Failed to register user');
  }
}

async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`${apiUrlUsers}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || 'User deleted');
    loadUsers();
    loadVehicles();
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Failed to delete user');
  }
}

// ========== RESERVATIONS ==========

async function handleReservationSubmit(e) {
  e.preventDefault();

  const user_id = document.getElementById('reservation_user_id')?.value;
  const slot_id = document.getElementById('reservation_slot_id')?.value || null;
  const vehicle_number = document.getElementById('reservation_vehicle_number')?.value.trim();
  const start_time = document.getElementById('reservation_start_time')?.value;
  const end_time = document.getElementById('reservation_end_time')?.value;

  if (!user_id || !vehicle_number || !start_time || !end_time) {
    alert('Please fill all required fields');
    return;
  }

  if (new Date(start_time) >= new Date(end_time)) {
    alert('End time must be after start time');
    return;
  }

  try {
    const res = await fetch(apiUrlReservations, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, slot_id, vehicle_number, start_time, end_time })
    });
    const data = await res.json();
    alert('Reservation added successfully');
    e.target.reset();
    loadReservations();
    loadSlotsForReservation();
  } catch (err) {
    console.error('Error adding reservation:', err);
    alert('Failed to add reservation');
  }
}

async function loadUsersForReservation() {
  try {
    const res = await fetch(apiUrlUsers);
    const users = await res.json();
    const userSelect = document.getElementById('reservation_user_id');
    if (!userSelect) return;

    userSelect.innerHTML = '<option value="">Select User</option>';
    users.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u.user_id;
      opt.textContent = `${u.name} (ID: ${u.user_id})`;
      userSelect.appendChild(opt);
    });
  } catch (err) {
    console.error('Error loading users:', err);
    alert('Failed to load users for reservation');
  }
}

async function loadSlotsForReservation() {
  try {
    const res = await fetch(apiUrlSlots);
    const slots = await res.json();
    const slotSelect = document.getElementById('reservation_slot_id');
    if (!slotSelect) return;

    slotSelect.innerHTML = '<option value="">-- Select slot (optional) --</option>';
    slots.forEach(slot => {
      if (slot.status === 'available') {
        const opt = document.createElement('option');
        opt.value = slot.slot_id;
        opt.textContent = `Lot ${slot.lot_id} - Slot ${slot.slot_number}`;
        slotSelect.appendChild(opt);
      }
    });
  } catch (err) {
    console.error('Error loading slots:', err);
    alert('Failed to load slots for reservation');
  }
}

async function loadReservations() {
  try {
    const res = await fetch(apiUrlReservations);
    const reservations = await res.json();
    const tbody = document.querySelector('#reservation-list tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    reservations.forEach(r => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${r.reservation_id}</td>
        <td>${r.user_name || r.user_id}</td>
        <td>${r.slot_number || 'N/A'}</td>
        <td>${r.vehicle_number}</td>
        <td>${new Date(r.start_time).toLocaleString()}</td>
        <td>${new Date(r.end_time).toLocaleString()}</td>
        <td>${r.status}</td>
        <td>${r.payment_status}</td>
        <td><button onclick="deleteReservation(${r.reservation_id})">Delete</button></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading reservations:', err);
    alert('Failed to load reservations');
  }
}

async function deleteReservation(id) {
  if (!confirm('Are you sure you want to delete this reservation?')) return;

  try {
    const res = await fetch(`${apiUrlReservations}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || 'Reservation deleted');
    loadReservations();
    loadSlotsForReservation();
  } catch (err) {
    console.error('Error deleting reservation:', err);
    alert('Failed to delete reservation');
  }
}

// ========== PARKING LOTS ==========

async function loadParkingLots() {
  try {
    const res = await fetch(apiUrlParkingLots);
    const data = await res.json();
    const tbody = document.querySelector('#parking-lot-list tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    data.forEach(lot => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${lot.lot_id}</td>
        <td>${lot.name}</td>
        <td>${lot.location}</td>
        <td>${lot.total_slots}</td>
        <td>${lot.available_slots}</td>
        <td>${lot.price_per_hour.toFixed(2)}</td>
        <td>
          <button onclick="editParkingLot(${lot.lot_id})">Edit</button>
          <button onclick="deleteParkingLot(${lot.lot_id})">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error('Error loading parking lots:', err);
    alert('Failed to load parking lots');
  }
}

async function handleParkingLotSubmit(e) {
  e.preventDefault();

  const lotId = document.getElementById('parking-lot-id')?.value;
  const name = document.getElementById('parking-lot-name')?.value.trim();
  const location = document.getElementById('parking-lot-location')?.value.trim();
  const totalSlots = parseInt(document.getElementById('parking-lot-total-slots')?.value);
  const availableSlots = parseInt(document.getElementById('parking-lot-available-slots')?.value);
  const pricePerHour = parseFloat(document.getElementById('parking-lot-price')?.value);

  if (!name || !location || isNaN(totalSlots) || isNaN(availableSlots) || isNaN(pricePerHour)) {
    alert('Please fill all parking lot fields correctly');
    return;
  }

  const lotData = { name, location, total_slots: totalSlots, available_slots: availableSlots, price_per_hour: pricePerHour };

  try {
    let res;
    if (lotId) {
      // Edit existing
      res = await fetch(`${apiUrlParkingLots}/${lotId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotData)
      });
    } else {
      // Create new
      res = await fetch(apiUrlParkingLots, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lotData)
      });
    }
    const data = await res.json();
    alert(lotId ? 'Parking lot updated' : 'Parking lot added');
    resetParkingLotForm();
    loadParkingLots();
  } catch (err) {
    console.error('Error saving parking lot:', err);
    alert('Failed to save parking lot');
  }
}

function resetParkingLotForm() {
  const form = document.getElementById('parking-lot-form');
  if (!form) return;
  form.reset();
  document.getElementById('parking-lot-id').value = '';
  document.getElementById('cancel-edit').style.display = 'none';
}

async function editParkingLot(id) {
  try {
    const res = await fetch(`${apiUrlParkingLots}/${id}`);
    const lot = await res.json();

    document.getElementById('parking-lot-id').value = lot.lot_id;
    document.getElementById('parking-lot-name').value = lot.name;
    document.getElementById('parking-lot-location').value = lot.location;
    document.getElementById('parking-lot-total-slots').value = lot.total_slots;
    document.getElementById('parking-lot-available-slots').value = lot.available_slots;
    document.getElementById('parking-lot-price').value = lot.price_per_hour;

    document.getElementById('cancel-edit').style.display = 'inline-block';
  } catch (err) {
    console.error('Error fetching parking lot:', err);
    alert('Failed to load parking lot data for edit');
  }
}

async function deleteParkingLot(id) {
  if (!confirm('Are you sure you want to delete this parking lot?')) return;

  try {
    const res = await fetch(`${apiUrlParkingLots}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    alert(data.message || 'Parking lot deleted');
    loadParkingLots();
  } catch (err) {
    console.error('Error deleting parking lot:', err);
    alert('Failed to delete parking lot');
  }
}

// ========== PAYMENTS ==========

async function fetchPayments() {
  try {
    const res = await fetch(apiUrlPayments);
    const payments = await res.json();
    const tbody = document.querySelector('#paymentsTable tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    payments.forEach(p => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${p.payment_id}</td>
        <td>${p.reservation_id}</td>
        <td>${p.amount.toFixed(2)}</td>
        <td>${p.payment_method}</td>
        <td>${new Date(p.payment_date).toLocaleString()}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    alert('Failed to fetch payments');
  }
}

async function handlePaymentSubmit(e) {
  e.preventDefault();

  // Removed reservation_id input
  // const reservation_id = document.getElementById('payment_reservation_id')?.value;

  const amount = parseFloat(document.getElementById('payment_amount')?.value);
  const payment_method = document.getElementById('payment_method')?.value;

  if (isNaN(amount) || !payment_method) {
    alert('Please fill all payment fields');
    return;
  }

  try {
    // Removed reservation_id from request body
    const res = await fetch(apiUrlPayments, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, payment_method })  // no reservation_id
    });
    const data = await res.json();
    alert('Payment recorded successfully');
    e.target.reset();
    fetchPayments();
  } catch (err) {
    console.error('Error recording payment:', err);
    alert('Failed to record payment');
  }
}
