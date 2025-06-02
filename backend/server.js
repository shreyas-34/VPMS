
const express = require('express');
const mysql   = require('mysql2');
const cors    = require('cors');

const app  = express();
const PORT = 3000;


// Middleware

app.use(cors());
app.use(express.json());


// MySQL connection

const dbPassword = process.env.DB_PASSWORD;
if (dbPassword === undefined) {
  console.error('Database connection failed: DB_PASSWORD environment variable is required.');
  process.exit(1);
}

const db = mysql.createConnection({
  host    : 'localhost',
  user    : 'root',
  password: dbPassword,
  database: 'VPMS',
});

db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('MySQL connected');
});


// Helper for error logging

const sqlHandler = (res, err, results, notFoundMsg = 'Not found') => {
  if (err) {
    console.error('SQL error:', err.sqlMessage || err);
    return res.status(500).json({ error: err.sqlMessage || err });
  }
  if (results?.affectedRows === 0 || results?.length === 0) {
    return res.status(404).json({ error: notFoundMsg });
  }
  return null; // no error
};


// VEHICLES

app.get('/vehicles', (_, res) => {
  db.query('SELECT * FROM Vehicles', (err, results) => {
    if (sqlHandler(res, err)) return;
    res.json(results);
  });
});

app.post('/vehicles', (req, res) => {
  const { user_id, vehicle_number, vehicle_type } = req.body;
  db.query(
    'INSERT INTO Vehicles (user_id, vehicle_number, vehicle_type) VALUES (?,?,?)',
    [user_id, vehicle_number, vehicle_type],
    (err, result) => {
      if (sqlHandler(res, err)) return;
      res.json({ message: 'Vehicle added', vehicle_id: result.insertId });
    }
  );
});

app.delete('/vehicles/:id', (req, res) => {
  db.query(
    'DELETE FROM Vehicles WHERE vehicle_id = ?',
    [req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Vehicle not found')) return;
      res.json({ message: 'Vehicle deleted' });
    }
  );
});


// USERS

app.get('/users', (_, res) => {
  db.query('SELECT user_id, name FROM Users', (err, results) => {
    if (sqlHandler(res, err)) return;
    res.json(results);
  });
});

app.post('/users', (req, res) => {
  const { name, email, password, phone, role } = req.body;
  db.query(
    'INSERT INTO Users (name, email, password_hash, phone, role) VALUES (?,?,?,?,?)',
    [name, email, password, phone, role],
    (err, result) => {
      if (sqlHandler(res, err)) return;
      res.json({ message: 'User registered', user_id: result.insertId });
    }
  );
});

app.delete('/users/:id', (req, res) => {
  db.query(
    'DELETE FROM Users WHERE user_id = ?',
    [req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'User not found')) return;
      res.json({ message: 'User deleted' });
    }
  );
});


// PARKING SLOTS

app.get('/parking_slots', (_, res) => {
  db.query('SELECT * FROM Parking_Slots ORDER BY slot_id', (err, results) => {
    if (sqlHandler(res, err)) return;
    res.json(results);
  });
});

app.get('/parking_slots/:id', (req, res) => {
  db.query(
    'SELECT * FROM Parking_Slots WHERE slot_id = ?',
    [req.params.id],
    (err, results) => {
      if (sqlHandler(res, err, results, 'Slot not found')) return;
      res.json(results[0]);
    }
  );
});

app.post('/parking_slots', (req, res) => {
  const { lot_id, slot_number, status = 'available', vehicle_id = null } = req.body;
  db.query(
    'INSERT INTO Parking_Slots (lot_id, slot_number, status, vehicle_id) VALUES (?,?,?,?)',
    [lot_id, slot_number, status, vehicle_id],
    (err, result) => {
      if (sqlHandler(res, err)) return;
      res.json({ message: 'Parking slot added', slot_id: result.insertId });
    }
  );
});

app.put('/parking_slots/:id', (req, res) => {
  const { lot_id, slot_number, status, vehicle_id } = req.body;
  db.query(
    `UPDATE Parking_Slots
     SET lot_id = ?, slot_number = ?, status = ?, vehicle_id = ?, last_updated = NOW()
     WHERE slot_id = ?`,
    [lot_id, slot_number, status, vehicle_id, req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Slot not found')) return;
      res.json({ message: 'Parking slot updated' });
    }
  );
});

app.delete('/parking_slots/:id', (req, res) => {
  db.query(
    'DELETE FROM Parking_Slots WHERE slot_id = ?',
    [req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Slot not found')) return;
      res.json({ message: 'Parking slot deleted' });
    }
  );
});


// RESERVATIONS

app.get('/reservations', (_, res) => {
  const sql = `
    SELECT r.*, u.name AS user_name, ps.slot_number
    FROM Reservations r
    LEFT JOIN Users u ON r.user_id = u.user_id
    LEFT JOIN Parking_Slots ps ON r.slot_id = ps.slot_id
    ORDER BY r.created_at DESC`;
  db.query(sql, (err, results) => {
    if (sqlHandler(res, err)) return;
    res.json(results);
  });
});

app.post('/reservations', (req, res) => {
  const {
    user_id,
    slot_id = null,
    vehicle_number,
    start_time,
    end_time,
    status = 'active',
    payment_status = 'pending',
  } = req.body;
  db.query(
    `INSERT INTO Reservations
     (user_id, slot_id, vehicle_number, start_time, end_time, status, payment_status)
     VALUES (?,?,?,?,?,?,?)`,
    [user_id, slot_id, vehicle_number, start_time, end_time, status, payment_status],
    (err, result) => {
      if (sqlHandler(res, err)) return;
      res.json({ message: 'Reservation created', reservation_id: result.insertId });
    }
  );
});

app.put('/reservations/:id', (req, res) => {
  const { status, payment_status } = req.body;
  db.query(
    'UPDATE Reservations SET status = ?, payment_status = ? WHERE reservation_id = ?',
    [status, payment_status, req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Reservation not found')) return;
      res.json({ message: 'Reservation updated' });
    }
  );
});

app.delete('/reservations/:id', (req, res) => {
  db.query(
    'DELETE FROM Reservations WHERE reservation_id = ?',
    [req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Reservation not found')) return;
      res.json({ message: 'Reservation deleted' });
    }
  );
});


// PARKING LOTS

app.get('/parking_lots', (_, res) => {
  db.query('SELECT * FROM Parking_Lots ORDER BY lot_id DESC', (err, results) => {
    if (sqlHandler(res, err)) return;
    res.json(results);
  });
});

app.post('/parking_lots', (req, res) => {
  const { name, location, total_slots, price_per_hour } = req.body;
  if (!name || !location || !total_slots || !price_per_hour) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.query(
    `INSERT INTO Parking_Lots
     (name, location, total_slots, available_slots, price_per_hour)
     VALUES (?,?,?,?,?)`,
    [name, location, total_slots, total_slots, price_per_hour],
    (err, result) => {
      if (sqlHandler(res, err)) return;
      res.json({ message: 'Parking lot added', lot_id: result.insertId });
    }
  );
});

app.put('/parking_lots/:id', (req, res) => {
  const { name, location, total_slots, available_slots, price_per_hour } = req.body;
  db.query(
    `UPDATE Parking_Lots
     SET name = ?, location = ?, total_slots = ?, available_slots = ?, price_per_hour = ?
     WHERE lot_id = ?`,
    [name, location, total_slots, available_slots, price_per_hour, req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Parking lot not found')) return;
      res.json({ message: 'Parking lot updated' });
    }
  );
});

app.delete('/parking_lots/:id', (req, res) => {
  db.query(
    'DELETE FROM Parking_Lots WHERE lot_id = ?',
    [req.params.id],
    (err, result) => {
      if (sqlHandler(res, err, result, 'Parking lot not found')) return;
      res.json({ message: 'Parking lot deleted' });
    }
  );
});


// PAYMENTS


// Get all payments
app.get('/payments', (req, res) => {
  const sql = `
    SELECT p.payment_id, p.user_id, p.amount, p.payment_method, p.status, p.transaction_time, u.name AS user_name
    FROM Payments p
    LEFT JOIN Users u ON p.user_id = u.user_id
    ORDER BY p.transaction_time DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// CREATE a new payment (without reservation_id)
app.post('/payments', (req, res) => {
  const { user_id, amount, payment_method, status = 'pending' } = req.body;

  if (!user_id || !amount || !payment_method) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    INSERT INTO Payments (user_id, amount, payment_method, status)
    VALUES (?, ?, ?, ?)
  `;

  db.query(sql, [user_id, amount, payment_method, status], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Payment recorded', payment_id: result.insertId });
  });
});

// UPDATE payment status
app.put('/payments/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  const sql = 'UPDATE Payments SET status = ? WHERE payment_id = ?';
  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment status updated' });
  });
});

// DELETE a payment
app.delete('/payments/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM Payments WHERE payment_id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  });
});



// Start server

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
