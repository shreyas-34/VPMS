const apiUrlSlots = 'http://localhost:3000/parking_slots';

document.getElementById('add-slot-form').addEventListener('submit', e => {
  e.preventDefault();

  const lot_id = document.getElementById('lot_id').value;
  const slot_number = document.getElementById('slot_number').value;
  const status = document.getElementById('status').value;
  const vehicle_id = document.getElementById('vehicle_id').value || null;

  fetch(apiUrlSlots, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lot_id, slot_number, status, vehicle_id })
  })
    .then(res => res.json())
    .then(data => {
      alert('Parking slot added!');
      e.target.reset();
      loadSlots();
    })
    .catch(err => console.error('Error adding slot:', err));
});

function loadSlots() {
  fetch(apiUrlSlots)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById('slots-list');
      list.innerHTML = '';
      data.forEach(slot => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${slot.slot_id}</td>
          <td>${slot.lot_id}</td>
          <td>${slot.slot_number}</td>
          <td>${slot.status}</td>
          <td>${slot.vehicle_id || '-'}</td>
          <td>${new Date(slot.last_updated).toLocaleString()}</td>
          <td>
            <button onclick="deleteSlot(${slot.slot_id})">Delete</button>
            <button onclick="showEditForm(${slot.slot_id})">Edit</button>
          </td>
        `;
        list.appendChild(row);
      });
    })
    .catch(err => console.error('Error loading slots:', err));
}

function deleteSlot(id) {
  if (!confirm('Delete this parking slot?')) return;

  fetch(`${apiUrlSlots}/${id}`, { method: 'DELETE' })
    .then(res => res.json())
    .then(data => {
      alert('Slot deleted!');
      loadSlots();
    })
    .catch(err => console.error('Error deleting slot:', err));
}

// Simple edit UI below the list:
function showEditForm(id) {
  const slot = document.getElementById(`slot-edit-form`);
  if (slot) slot.remove();

  fetch(`${apiUrlSlots}/${id}`)
    .then(res => res.json())
    .then(data => {
      const form = document.createElement('form');
      form.id = 'slot-edit-form';
      form.innerHTML = `
        <h3>Edit Slot ID: ${data.slot_id}</h3>
        <input type="number" id="edit_lot_id" value="${data.lot_id}" required />
        <input type="text" id="edit_slot_number" value="${data.slot_number}" required />
        <select id="edit_status">
          <option value="available" ${data.status === 'available' ? 'selected' : ''}>Available</option>
          <option value="occupied" ${data.status === 'occupied' ? 'selected' : ''}>Occupied</option>
          <option value="reserved" ${data.status === 'reserved' ? 'selected' : ''}>Reserved</option>
        </select>
        <input type="number" id="edit_vehicle_id" value="${data.vehicle_id || ''}" placeholder="Vehicle ID (optional)" />
        <button type="submit">Save Changes</button>
        <button type="button" onclick="document.getElementById('slot-edit-form').remove()">Cancel</button>
      `;

      form.addEventListener('submit', e => {
        e.preventDefault();

        const updatedSlot = {
          lot_id: form.querySelector('#edit_lot_id').value,
          slot_number: form.querySelector('#edit_slot_number').value,
          status: form.querySelector('#edit_status').value,
          vehicle_id: form.querySelector('#edit_vehicle_id').value || null,
        };

        fetch(`${apiUrlSlots}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSlot)
        })
          .then(res => res.json())
          .then(data => {
            alert('Slot updated!');
            form.remove();
            loadSlots();
          })
          .catch(err => console.error('Error updating slot:', err));
      });

      document.querySelector('.main-content').appendChild(form);
    })
    .catch(err => console.error('Error fetching slot:', err));
}

// Load slots on page load
loadSlots();
