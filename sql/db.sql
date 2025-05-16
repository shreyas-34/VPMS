create database VPMS;
use VPMS;

-- Users Table
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    role ENUM('admin', 'user', 'staff') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parking Lots Table
CREATE TABLE Parking_Lots (
    lot_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location TEXT NOT NULL,
    total_slots INT NOT NULL,
    available_slots INT NOT NULL DEFAULT 0,
    price_per_hour DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles Table
CREATE TABLE Vehicles (
    vehicle_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    vehicle_number VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type ENUM('car', 'bike', 'truck') NOT NULL,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Parking Slots Table
CREATE TABLE Parking_Slots (
    slot_id SERIAL PRIMARY KEY,
    lot_id BIGINT UNSIGNED NOT NULL,
    slot_number VARCHAR(10) NOT NULL,
    status ENUM('available', 'occupied', 'reserved') DEFAULT 'available',
    vehicle_id BIGINT UNSIGNED NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lot_id) REFERENCES Parking_Lots(lot_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id) ON DELETE SET NULL
);



-- Payments Table
CREATE TABLE Payments (
    payment_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('card', 'cash', 'wallet', 'UPI') NOT NULL,
    status ENUM('successful', 'failed', 'pending') DEFAULT 'pending',
    transaction_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
);


-- Logs Table
CREATE TABLE Logs (
    log_id SERIAL PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL
);




