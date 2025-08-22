#!/bin/bash
# Make sure this file has executable permissions, run `chmod +x build-app.sh`

# Exit the script if any command fails
set -e

# Build assets using NPM
#npm run build

# Clear cache
php artisan view:clear

# Cache the various components of the Laravel application
php artisan route:cache
