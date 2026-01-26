"""Promise Engine application entry point."""

import os
import subprocess
from dotenv import load_dotenv
from app import create_app

# Load environment variables
load_dotenv()

# Run migrations
print("Running database migrations...")
subprocess.run(["python3", "-m", "alembic", "upgrade", "head"], check=True)

# Create Flask app
app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=True
    )
