from app import create_app
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env file

app = create_app()


if __name__ == "__main__":
    app.run(debug=True, port=5001)