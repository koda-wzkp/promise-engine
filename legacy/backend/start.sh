#!/bin/bash

# Railway startup script for Promise Engine backend

echo "Running database migrations..."
python -m alembic upgrade head

echo "Starting Flask server..."
python run.py
