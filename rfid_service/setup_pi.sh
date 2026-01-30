#!/bin/bash
set -e

echo "Updating system and installing dependencies..."
sudo apt-get update
sudo apt-get install -y python3-dev python3-pip python3-venv

if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv .venv
fi

echo "Activating virtual environment..."
source .venv/bin/activate

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Setup complete."
echo "IMPORTANT: Please ensure SPI is enabled via 'sudo raspi-config' (Interface Options -> SPI)."
