# Mission Control Center System (MCCS) - Backend

![Laravel](https://img.shields.io/badge/laravel-%23FF2D20.svg?style=for-the-badge&logo=laravel&logoColor=white)
![MySQL](https://img.shields.io/badge/mysql-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

This repository contains the backend infrastructure for the **AI-Powered Mission Control Center System (MCCS)**, developed for the **Egyptian Space Agency (EgSA)** as part of the 2026 Graduation Project for the Faculty of Computer Science and AI.

## 🚀 Overview

The MCCS Backend is a robust, hybrid architecture designed to handle complex satellite mission operations. It combines the structured reliability of Laravel with the high-performance AI capabilities of FastAPI to provide real-time telemetry monitoring, mission planning, and anomaly detection.

## 🛠 Tech Stack

- **Primary Framework:** Laravel (PHP) - Handles business logic, authentication, and core API services.
- **Database:** MySQL - Relational data storage for missions, users, and logs.
- **Real-time & Caching:** Redis - Manages telemetry data streams and pub/sub messaging.
- **Architecture:** Microservices-oriented with RESTful APIs.

## 🌟 Key Features

- **Satellite Telemetry Processing:** Real-time ingestion and visualization of satellite data.
- **AI-Powered Anomaly Detection:** Using deep learning (CNN/ResNet) to identify system irregularities.
- **Mission Control Dashboard:** API support for full-scale mission management and command execution.
- **Role-Based Access Control (RBAC):** Secure access for mission operators, analysts, and administrators.
- **Scalable Architecture:** Built to handle high-frequency data from multiple orbital assets.
