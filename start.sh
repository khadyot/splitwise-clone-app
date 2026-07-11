#!/bin/bash
# start.sh

# Force local npm cache to bypass global permission errors
export NPM_CONFIG_CACHE=$(pwd)/.npm-cache

echo "Installing dependencies using local cache..."
npm install

echo "Starting Splitwise Clone..."
npm run dev
