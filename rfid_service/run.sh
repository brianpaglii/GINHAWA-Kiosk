#!/bin/bash
set -e

# Ensure we are in the script's directory
cd "$(dirname "$0")"

# Activate virtual environment
source .venv/bin/activate

# Run the script
python read_tag.py
