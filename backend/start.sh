#!/bin/bash

# Railway startup script for Promise Engine backend

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running database migrations..."
python -m alembic upgrade head

echo "Starting Flask server..."
python run.py
