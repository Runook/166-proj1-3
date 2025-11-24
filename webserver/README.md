# 🎓 Graduate Location Map

An interactive web application that visualizes graduate locations, industries, and club affiliations on a geographic map.

## Features

- **Interactive Map**: View graduate locations across the United States using Leaflet
- **Student Profiles**: See detailed information including name, degree, industry, and contact
- **Club Management**: Add, search, and delete student organizations
- **Filtering**: Filter graduates by club membership and graduation year
- **Industry Insights**: View what industries graduates are working in (supports multiple industries per student)
- **Location Tracking**: Track where graduates currently live
- **User Authentication**: Simple login for user identification
- **Full-Text Search**: Search clubs by description and activities
- **Student Management**: View, search, and delete students
- **CRUD Operations**: Complete Create, Read, Update, Delete functionality

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
- `alumni_profile` - Alumni profiles using composite location type
- `app_user` - User authentication

### Advanced PostgreSQL Features

The application implements three advanced PostgreSQL features as part of the course requirements:

**1. Full-Text Search (TEXT attribute)**
- Added `about` TEXT column to `club` table with description of club activities
- Implemented full-text search using `tsvector` and GIN index
- Enables searching clubs by keywords: research, project, journal, performance, etc.
- Route: `/search_clubs` with relevance ranking using `ts_rank()`

**2. Array Attribute**
- Added `industry_tags` VARCHAR[] array to `student` table
- Stores multiple industries per student reflecting cross-industry experience
- Query using `ANY()`, `ARRAY_AGG()`, and `ARRAY_LENGTH()` operators
- Displayed on map popups and alumni profile pages

**3. Composite Type**
- Created `alumni_profile` table using existing `location` composite type
- Composite type includes: loc_id, city, state, country
- Enables querying location fields without additional JOINs
- Accessed using `(current_location).city` syntax

## Usage

### Login

The page initially directs you to a login page. To view, create an account by providing an email address and submitting your name

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
4. Add description (optional but recommended for searchability)
5. Submit to add to the database

### Searching Clubs

1. Click **"Search Clubs"** button
2. Enter keywords to search club descriptions (e.g., "research", "project", "journal")
3. Results ranked by relevance using full-text search
4. View or delete clubs from search results

### Managing Students

1. Click **"Manage Students"** button
2. View all students in a list format
3. Use search box to filter students by name
4. Click "View" to see detailed profile or "Delete" to remove student
5. Deleting a student removes all associated data (graduation records, memberships, work history)

### Viewing Alumni Profiles

1. Click on any graduate marker on the map
2. Click "View Full Profile" link in popup
3. See detailed information including:
   - Contact information and current location (using composite type)
   - Multiple industries (from array attribute)
   - Club memberships with descriptions
   - Option to delete student from profile page

### Filtering

Use the dropdown menus at the top to filter by:
- **Club**: View members of a specific organization
- **Graduation Year**: View graduates from a specific year

### Deleting Data

**Delete Student:**
- From alumni profile page (Danger Zone at bottom)
- From Manage Students page
- Cascades to all related records

**Delete Club:**
- From Search Clubs page
- Only allowed if club has no active members

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

## PostgreSQL Account

The database resides in the courses server under the account for jc6292

## Web Application URL

http://34.139.229.138:8111/

## License

Educational project for Columbia University COMS4111 Intro to Databases.

Student UNIs: jc6292, sd3888
