#!/bin/bash

echo "🚀 Starting Setup for Digital Service Mobile App..."

# 1. Check for Flutter
if ! command -v flutter &> /dev/null; then
    echo "❌ Flutter is not installed. Please install Flutter SDK first."
    exit 1
fi

# 2. Install dependencies
echo "📦 Installing Dependencies..."
flutter pub get

# 3. Run Build Runner
echo "⚙️ Running Code Generation..."
dart run build_runner build --delete-conflicting-outputs

echo ""
echo "✅ SETUP COMPLETE!"
echo "------------------------------------------------"
echo "To run the app, make sure an emulator or device is connected."
echo "Command to run:"
echo "flutter run"
echo ""
echo "Note: Ensure the backend server is running for the app to work correctly."
echo "------------------------------------------------"
