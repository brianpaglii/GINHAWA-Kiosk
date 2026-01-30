#!/bin/bash
set -e

# Ensure we are in the script's directory
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
    echo "Virtual environment not found. Please run setup_pi.sh first."
    exit 1
fi

source .venv/bin/activate
python read_tag.py
