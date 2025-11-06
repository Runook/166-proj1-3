# 🎓 Graduate Location Map

An interactive web application that visualizes graduate locations, industries, and club affiliations on a geographic map.

## Features

- 🗺️ **Interactive Map**: View graduate locations across the United States using Leaflet
- 👥 **Student Profiles**: See detailed information including name, degree, industry, and contact
- 🏛️ **Club Management**: Add and manage student organizations
- 🔍 **Filtering**: Filter graduates by club membership and graduation year
- 💼 **Industry Insights**: View what industries graduates are working in
- 📍 **Location Tracking**: Track where graduates currently live

## Quick Start

### Running Locally

1. **Activate the virtual environment**
   ```bash
   source venv/bin/activate
   ```

2. **Start the server**
   ```bash
   python3 server.py
   ```

3. **Open your browser**
   
   Navigate to: http://localhost:8111

4. **Stop the server**
   
   Press `Ctrl+C` in the terminal

## Deploying to Google Cloud

### Prerequisites on VM

Install required dependencies:
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv screen git
```

### Deployment Steps

1. **Clone the repository**
   ```bash
   git clone YOUR_REPOSITORY_URL
   cd webserver
   ```

2. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run with screen (background process)**
   ```bash
   screen -S graduate-map
   python3 server.py
   ```
   
   Press `Ctrl+A` then `D` to detach

5. **Access the application**
   ```
   http://YOUR_VM_IP:8111
   ```

## Technology Stack

- **Backend**: Python Flask
- **Database**: PostgreSQL (SQLAlchemy ORM)
- **Frontend**: HTML, CSS, JavaScript
- **Maps**: Leaflet.js
- **Deployment**: Google Cloud Compute Engine

## Database

The application connects to a PostgreSQL database with the following schema:
- `student` - Student information
- `club` - Student organizations
- `location` - Geographic locations
- `industry` - Industry sectors
- `graduated_in` - Graduation records
- `lives_in` - Student residential history
- `works_in` - Student employment history
- `member_of` - Club memberships

## Usage

### Viewing the Map

The home page displays all graduates on an interactive map. Click on any marker to view:
- Student names
- Degrees and graduation years
- Current industries
- Club affiliations
- Contact information

### Adding a Student

1. Click **"Add Student"** button
2. Fill in required fields:
   - First Name
   - Last Name
   - Current Location (required)
3. Optionally add:
   - Email
   - Degree and graduation year
   - Club membership
   - Industry
4. Submit to see the student appear on the map

### Adding a Club

1. Click **"Add Club"** button
2. Enter club name
3. Select category (Academic, Arts, Sports, Cultural, Professional, Other)
4. Submit to add to the database

### Filtering

Use the dropdown menus at the top to filter by:
- **Club**: View members of a specific organization
- **Graduation Year**: View graduates from a specific year

## Dependencies

See `requirements.txt` for the complete list. Main packages:
- Flask 3.1.2
- SQLAlchemy 2.0.43
- psycopg2-binary 2.9.10
- click 8.3.0

## Screen Commands (for VM deployment)

```bash
screen -ls              # List all screen sessions
screen -r graduate-map  # Reattach to session
screen -d -r graduate-map  # Force reattach
```

Inside screen:
- `Ctrl+A` then `D` - Detach (keep running)
- `Ctrl+C` - Stop the application

## Updating the Application

On your VM:

```bash
screen -r graduate-map  # Reattach to screen
# Press Ctrl+C to stop
git pull origin main    # Update code
python3 server.py       # Restart
# Press Ctrl+A, D to detach
```

## Port Configuration

The application runs on port **8111** by default, as required for the course deployment.

## License

Educational project for Columbia University COMS4111 Intro to Databases.

Student UNIs: jc6292, sd3888
