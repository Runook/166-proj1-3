
"""
Columbia's COMS W4111.001 Introduction to Databases
Example Webserver
To run locally:
    python server.py
Go to http://localhost:8111 in your browser.
A debugger such as "pdb" may be helpful for debugging.
Read about it online.
"""
import os
# accessible as a variable in index.html:
from sqlalchemy import *
from sqlalchemy.pool import NullPool
from flask import Flask, request, render_template, g, redirect, Response, abort, session
from werkzeug.security import generate_password_hash, check_password_hash

tmpl_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'templates')
app = Flask(__name__, template_folder=tmpl_dir)

# Secret key for session management (change this to a random string in production)
app.secret_key = 'your-secret-key-change-this-in-production'


#
# The following is a dummy URI that does not connect to a valid database. You will need to modify it to connect to your Part 2 database in order to use the data.
#
# XXX: The URI should be in the format of: 
#
#     postgresql://USER:PASSWORD@34.139.8.30/proj1part2
#
# For example, if you had username ab1234 and password 123123, then the following line would be:
#
#     DATABASEURI = "postgresql://ab1234:123123@34.139.8.30/proj1part2"
#
# Modify these with your own credentials you received from TA!
DATABASE_USERNAME = "jc6292"
DATABASE_PASSWRD = "854037"
DATABASE_HOST = "34.139.8.30"
DATABASEURI = f"postgresql://{DATABASE_USERNAME}:{DATABASE_PASSWRD}@{DATABASE_HOST}/proj1part2"


#
# This line creates a database engine that knows how to connect to the URI above.
# Using NullPool to avoid connection pool issues (important for shared databases)
#
engine = create_engine(DATABASEURI, poolclass=NullPool)

#
# Initialize user table if it doesn't exist
# This creates a users table in the jc6292 schema for authentication
#
def init_user_table():
	"""Create user table if it doesn't exist"""
	try:
		with engine.connect() as conn:
			create_user_table = """
			CREATE TABLE IF NOT EXISTS jc6292.app_user (
				user_id SERIAL PRIMARY KEY,
				username VARCHAR(50) UNIQUE NOT NULL,
				email VARCHAR(100),
				password_hash VARCHAR(255) NOT NULL,
				created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			)
			"""
			conn.execute(text(create_user_table))
			conn.commit()
			print("✅ User table initialized")
	except Exception as e:
		print(f"⚠️  User table initialization: {e}")

# Initialize user table on startup
init_user_table()


@app.before_request
def before_request():
	"""
	This function is run at the beginning of every web request 
	(every time you enter an address in the web browser).
	We use it to setup a database connection that can be used throughout the request.

	The variable g is globally accessible.
	"""
	# Don't connect to database for static files or login GET requests
	if request.endpoint in ['static'] or (request.endpoint == 'login' and request.method == 'GET'):
		g.conn = None
		return
	
	try:
		g.conn = engine.connect()
	except:
		print("uh oh, problem connecting to database")
		import traceback; traceback.print_exc()
		g.conn = None

@app.teardown_request
def teardown_request(exception):
	"""
	At the end of the web request, this makes sure to close the database connection.
	If you don't, the database could run out of memory!
	"""
	try:
		g.conn.close()
	except Exception as e:
		pass


#
# @app.route is a decorator around index() that means:
#   run index() whenever the user tries to access the "/" path using a GET request
#
# If you wanted the user to go to, for example, localhost:8111/foobar/ with POST or GET then you could use:
#
#       @app.route("/foobar/", methods=["POST", "GET"])
#
# PROTIP: (the trailing / in the path is important)
# 
# see for routing: https://flask.palletsprojects.com/en/1.1.x/quickstart/#routing
# see for decorators: http://simeonfranklin.com/blog/2012/jul/1/python-decorators-in-12-steps/
#
@app.route('/')
def index():
	"""
	Main page - Graduate Location Map
	Shows all graduates on a map with filtering options
	"""
	# Check if user is logged in
	if 'username' not in session:
		return redirect('/login')
	
	# Get filter parameters
	club_filter = request.args.get('club_id', '')
	year_filter = request.args.get('year', '')
	
	# Get all clubs for dropdown (including about text)
	clubs_query = "SELECT club_id, name, category, about FROM jc6292.club WHERE club_id IS NOT NULL ORDER BY name"
	cursor = g.conn.execute(text(clubs_query))
	clubs = []
	for result in cursor:
		if result[0] is not None:  # Extra safety check
			clubs.append({'id': result[0], 'name': result[1], 'category': result[2], 'about': result[3]})
	cursor.close()
	
	# Get all graduation years for dropdown
	years_query = "SELECT DISTINCT year FROM jc6292.graduated_in ORDER BY year DESC"
	cursor = g.conn.execute(text(years_query))
	years = []
	for result in cursor:
		years.append(result[0])
	cursor.close()
	
	# Build graduate query with filters (including industry_tags array)
	graduates_query = """
		SELECT 
			s.student_id,
			s.first_name,
			s.last_name,
			s.email,
			l.city,
			l.state,
			g.year as graduation_year,
			g.degree,
			g.honors,
			i.name as industry_name,
			c.name as club_name,
			c.category as club_category,
			s.industry_tags
		FROM jc6292.student s
		LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
		LEFT JOIN jc6292.lives_in li ON s.student_id = li.student_id AND li.until_date IS NULL
		LEFT JOIN jc6292.location l ON li.loc_id = l.loc_id
		LEFT JOIN jc6292.works_in w ON s.student_id = w.student_id AND w.end_year IS NULL
		LEFT JOIN jc6292.industry i ON w.industry_id = i.industry_id
		LEFT JOIN jc6292.member_of m ON s.student_id = m.student_id AND m.leave_date IS NULL
		LEFT JOIN jc6292.club c ON m.club_id = c.club_id
		WHERE l.loc_id IS NOT NULL
	"""
	
	# Add filters if provided
	params = {}
	if club_filter:
		# Filter for specific club, ensuring we only get students with that club
		graduates_query += " AND c.club_id = :club_id AND c.club_id IS NOT NULL"
		params['club_id'] = club_filter
	if year_filter:
		graduates_query += " AND g.year = :year"
		params['year'] = year_filter
	
	graduates_query += " ORDER BY s.last_name, s.first_name"
	
	cursor = g.conn.execute(text(graduates_query), params)
	graduates = []
	for result in cursor:
		graduates.append({
			'student_id': result[0],
			'first_name': result[1],
			'last_name': result[2],
			'email': result[3],
			'city': result[4],
			'state': result[5],
			'graduation_year': result[6],
			'degree': result[7],
			'honors': result[8],
			'industry': result[9],
			'club': result[10],
			'club_category': result[11],
			'industry_tags': result[12] if result[12] else []
		})
	cursor.close()
	
	context = dict(clubs=clubs, years=years, graduates=graduates, 
	               club_filter=club_filter, year_filter=year_filter,
	               username=session.get('username'))
	return render_template("index.html", **context)

# Add student page - shows form
@app.route('/add_student')
def add_student_page():
	"""Display form to add a new student"""
	# Get clubs for dropdown
	clubs_query = "SELECT club_id, name FROM jc6292.club WHERE club_id IS NOT NULL ORDER BY name"
	cursor = g.conn.execute(text(clubs_query))
	clubs = [{'id': result[0], 'name': result[1]} for result in cursor if result[0] is not None]
	cursor.close()
	
	# Get locations for dropdown
	locations_query = "SELECT loc_id, city, state FROM jc6292.location WHERE loc_id IS NOT NULL ORDER BY city"
	cursor = g.conn.execute(text(locations_query))
	locations = [{'id': result[0], 'city': result[1], 'state': result[2]} for result in cursor if result[0] is not None]
	cursor.close()
	
	# Get industries for dropdown
	industries_query = "SELECT industry_id, name FROM jc6292.industry WHERE industry_id IS NOT NULL ORDER BY name"
	cursor = g.conn.execute(text(industries_query))
	industries = [{'id': result[0], 'name': result[1]} for result in cursor if result[0] is not None]
	cursor.close()
	
	context = dict(clubs=clubs, locations=locations, industries=industries)
	return render_template("add_student.html", **context)


# Add student - handle form submission
@app.route('/add_student', methods=['POST'])
def add_student():
	"""Add a new student to the database"""
	try:
		# Get form data
		first_name = request.form['first_name']
		last_name = request.form['last_name']
		email = request.form.get('email') or None
		club_id = request.form.get('club_id') or None
		location_id = request.form['location_id']
		industry_id = request.form.get('industry_id') or None
		graduation_year = request.form.get('graduation_year') or None
		degree = request.form.get('degree', 'BS')
		
		# Insert student
		params = {'first_name': first_name, 'last_name': last_name, 'email': email}
		result = g.conn.execute(text(
			'INSERT INTO jc6292.student (first_name, last_name, email) VALUES (:first_name, :last_name, :email) RETURNING student_id'
		), params)
		student_id = result.fetchone()[0]
		
		# Add location (required)
		g.conn.execute(text(
			'INSERT INTO jc6292.lives_in (student_id, loc_id, since_date) VALUES (:student_id, :loc_id, CURRENT_DATE)'
		), {'student_id': student_id, 'loc_id': location_id})
		
		# Add industry if provided
		if industry_id:
			import datetime
			current_year = datetime.datetime.now().year
			g.conn.execute(text(
				'INSERT INTO jc6292.works_in (student_id, industry_id, start_year) VALUES (:student_id, :industry_id, :start_year)'
			), {'student_id': student_id, 'industry_id': industry_id, 'start_year': current_year})
		
		# Add club membership if provided
		if club_id:
			g.conn.execute(text(
				'INSERT INTO jc6292.member_of (student_id, club_id, join_date) VALUES (:student_id, :club_id, CURRENT_DATE)'
			), {'student_id': student_id, 'club_id': club_id})
		
		# Add graduation record if provided
		if graduation_year and degree:
			g.conn.execute(text(
				'INSERT INTO jc6292.year_dim (year) VALUES (:year) ON CONFLICT (year) DO NOTHING'
			), {'year': graduation_year})
			g.conn.execute(text(
				'INSERT INTO jc6292.graduated_in (student_id, year, degree) VALUES (:student_id, :year, :degree)'
			), {'student_id': student_id, 'year': graduation_year, 'degree': degree})
		
		g.conn.commit()
		return redirect('/')
	except Exception as e:
		print(f"Error adding student: {e}")
		import traceback
		traceback.print_exc()
		return f"Error: {str(e)}", 500


@app.route('/add_club')
def add_club_page():
	"""Display form to add a new club"""
	return render_template("add_club.html")


# Search clubs by text (full-text search)
@app.route('/search_clubs')
def search_clubs():
	"""Search clubs using full-text search on about field"""
	if 'username' not in session:
		return redirect('/login')
	
	search_query = request.args.get('q', '')
	
	if search_query:
		# Full-text search
		search_sql = """
			SELECT club_id, name, category, about, 
			       ts_rank(about_tsv, query) AS rank
			FROM jc6292.club, 
			     to_tsquery('english', :search_query) query
			WHERE about_tsv @@ query
			ORDER BY rank DESC
		"""
		params = {'search_query': ' | '.join(search_query.split())}
		cursor = g.conn.execute(text(search_sql), params)
	else:
		# Show all clubs
		cursor = g.conn.execute(text("SELECT club_id, name, category, about, 0 as rank FROM jc6292.club ORDER BY name"))
	
	clubs = []
	for result in cursor:
		clubs.append({
			'id': result[0],
			'name': result[1],
			'category': result[2],
			'about': result[3],
			'rank': result[4] if len(result) > 4 else 0
		})
	cursor.close()
	
	context = dict(clubs=clubs, search_query=search_query, username=session.get('username'))
	return render_template("search_clubs.html", **context)


# View alumni profile (using composite type)
@app.route('/alumni/<int:student_id>')
def view_alumni_profile(student_id):
	"""View detailed alumni profile with composite location type"""
	if 'username' not in session:
		return redirect('/login')
	
	# Get student info with industry_tags array
	student_query = """
		SELECT s.student_id, s.first_name, s.last_name, s.email, s.industry_tags,
		       g.year, g.degree, g.honors
		FROM jc6292.student s
		LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
		WHERE s.student_id = :student_id
	"""
	cursor = g.conn.execute(text(student_query), {'student_id': student_id})
	result = cursor.fetchone()
	cursor.close()
	
	if not result:
		abort(404)
	
	student = {
		'id': result[0],
		'first_name': result[1],
		'last_name': result[2],
		'email': result[3],
		'industry_tags': result[4] if result[4] else [],
		'graduation_year': result[5],
		'degree': result[6],
		'honors': result[7]
	}
	
	# Get location using composite type from alumni_profile
	location_query = """
		SELECT (current_location).city, (current_location).state, (current_location).country,
		       bio, linkedin_url
		FROM jc6292.alumni_profile
		WHERE student_id = :student_id
	"""
	cursor = g.conn.execute(text(location_query), {'student_id': student_id})
	loc_result = cursor.fetchone()
	cursor.close()
	
	if loc_result:
		student['city'] = loc_result[0]
		student['state'] = loc_result[1]
		student['country'] = loc_result[2]
		student['bio'] = loc_result[3]
		student['linkedin_url'] = loc_result[4]
	
	# Get clubs
	clubs_query = """
		SELECT c.name, c.category, c.about
		FROM jc6292.member_of m
		JOIN jc6292.club c ON m.club_id = c.club_id
		WHERE m.student_id = :student_id AND m.leave_date IS NULL
	"""
	cursor = g.conn.execute(text(clubs_query), {'student_id': student_id})
	clubs = [{'name': r[0], 'category': r[1], 'about': r[2]} for r in cursor]
	cursor.close()
	
	context = dict(student=student, clubs=clubs, username=session.get('username'))
	return render_template("alumni_profile.html", **context)


# Add club page - shows form



# Add club - handle form submission
@app.route('/add_club', methods=['POST'])
def add_club():
	"""Add a new club to the database"""
	try:
		name = request.form['name']
		category = request.form.get('category', 'Other')
		about = request.form.get('about', '')
		
		params = {'name': name, 'category': category, 'about': about if about else None}
		g.conn.execute(text(
			'INSERT INTO jc6292.club (name, category, about) VALUES (:name, :category, :about)'
		), params)
		g.conn.commit()
		return redirect('/')
	except Exception as e:
		print(f"Error adding club: {e}")
		return f"Error: {str(e)}", 500


#
# Original example routes (kept for reference)
#
@app.route('/another')
def another():
	return render_template("another.html")


# Login page - show login form
@app.route('/login', methods=['GET'])
def login():
	"""Show login page"""
	return render_template("login.html")


# Login/Register - handle form submission
@app.route('/login', methods=['POST'])
def login_post():
	"""Handle login or registration with database"""
	username = request.form.get('username', '').strip()
	password = request.form.get('password', '')
	email = request.form.get('email', '').strip()
	action = request.form.get('action', 'signin')
	
	if not username or not password:
		return render_template("login.html", error="Please enter username and password")
	
	# Try to get or create a database connection with retry
	conn = g.conn
	should_close = False
	
	if conn is None:
		# Try to connect up to 3 times with delay
		import time
		for attempt in range(3):
			try:
				conn = engine.connect()
				should_close = True
				break
			except Exception as e:
				if attempt < 2:  # Not the last attempt
					print(f"Connection attempt {attempt + 1} failed, retrying...")
					time.sleep(1)  # Wait 1 second before retry
				else:
					print(f"Failed to create connection after 3 attempts: {e}")
					return render_template("login.html", error="Database is temporarily unavailable. Please try again in a moment.")
	
	try:
		if action == 'signup':
			# Registration: Validate inputs
			if not email:
				if should_close:
					conn.close()
				return render_template("login.html", error="Email is required for registration.")
			
			# Check if username already exists
			check_user_query = "SELECT user_id FROM jc6292.app_user WHERE username = :username"
			cursor = conn.execute(text(check_user_query), {'username': username})
			existing_user = cursor.fetchone()
			cursor.close()
			
			if existing_user:
				if should_close:
					conn.close()
				return render_template("login.html", error="Username already exists. Please choose another one.")
			
			# Check if email already exists
			check_email_query = "SELECT user_id FROM jc6292.app_user WHERE email = :email"
			cursor = conn.execute(text(check_email_query), {'email': email})
			existing_email = cursor.fetchone()
			cursor.close()
			
			if existing_email:
				if should_close:
					conn.close()
				return render_template("login.html", error="Email already registered. Please use a different email.")
			
			# Hash password and insert new user
			password_hash = generate_password_hash(password)
			insert_user_query = """
				INSERT INTO jc6292.app_user (username, email, password_hash)
				VALUES (:username, :email, :password_hash)
			"""
			conn.execute(text(insert_user_query), {
				'username': username,
				'email': email,
				'password_hash': password_hash
			})
			conn.commit()
			
			# Close connection if we created it
			if should_close:
				conn.close()
			
			# Auto-login after registration
			session['username'] = username
			if email:
				session['email'] = email
			return redirect('/')
		
		else:  # signin
			# Login: Verify username and password
			user_query = "SELECT user_id, username, email, password_hash FROM jc6292.app_user WHERE username = :username"
			cursor = conn.execute(text(user_query), {'username': username})
			user = cursor.fetchone()
			cursor.close()
			
			if not user:
				if should_close:
					conn.close()
				return render_template("login.html", error="Invalid username or password.")
			
			# Verify password
			if check_password_hash(user[3], password):  # user[3] is password_hash
				if should_close:
					conn.close()
				
				session['username'] = user[1]  # user[1] is username
				if user[2]:  # user[2] is email
					session['email'] = user[2]
				return redirect('/')
			else:
				if should_close:
					conn.close()
				return render_template("login.html", error="Invalid username or password.")
	
	except Exception as e:
		print(f"Error in login/register: {e}")
		import traceback
		traceback.print_exc()
		if should_close and conn:
			try:
				conn.close()
			except:
				pass
		return render_template("login.html", error="An error occurred. Please try again.")


# Delete student
@app.route('/delete_student/<int:student_id>', methods=['POST'])
def delete_student(student_id):
	"""Delete a student from the database"""
	if 'username' not in session:
		return redirect('/login')
	
	try:
		# Delete student (will cascade to related tables)
		g.conn.execute(text(
			'DELETE FROM jc6292.student WHERE student_id = :student_id'
		), {'student_id': student_id})
		g.conn.commit()
		return redirect('/')
	except Exception as e:
		print(f"Error deleting student: {e}")
		return f"Error: {str(e)}", 500


# Manage students page
@app.route('/manage_students')
def manage_students():
	"""Display all students for management"""
	if 'username' not in session:
		return redirect('/login')
	
	students_query = """
		SELECT 
			s.student_id,
			s.first_name,
			s.last_name,
			s.email,
			g.year as graduation_year,
			g.degree,
			(ap.current_location).city as city,
			(ap.current_location).state as state
		FROM jc6292.student s
		LEFT JOIN jc6292.graduated_in g ON s.student_id = g.student_id
		LEFT JOIN jc6292.alumni_profile ap ON s.student_id = ap.student_id
		ORDER BY s.last_name, s.first_name
	"""
	cursor = g.conn.execute(text(students_query))
	students = []
	for result in cursor:
		students.append({
			'student_id': result[0],
			'first_name': result[1],
			'last_name': result[2],
			'email': result[3],
			'graduation_year': result[4],
			'degree': result[5],
			'city': result[6],
			'state': result[7]
		})
	cursor.close()
	
	context = dict(students=students, username=session.get('username'))
	return render_template("manage_students.html", **context)


# Delete club
@app.route('/delete_club/<int:club_id>', methods=['POST'])
def delete_club(club_id):
	"""Delete a club from the database"""
	if 'username' not in session:
		return redirect('/login')
	
	try:
		# First check if club has members
		check_query = """
			SELECT COUNT(*) FROM jc6292.member_of 
			WHERE club_id = :club_id AND leave_date IS NULL
		"""
		cursor = g.conn.execute(text(check_query), {'club_id': club_id})
		member_count = cursor.fetchone()[0]
		cursor.close()
		
		if member_count > 0:
			return f"Cannot delete club: {member_count} active member(s) still in this club. Please remove members first.", 400
		
		# Delete club
		g.conn.execute(text(
			'DELETE FROM jc6292.club WHERE club_id = :club_id'
		), {'club_id': club_id})
		g.conn.commit()
		return redirect('/search_clubs')
	except Exception as e:
		print(f"Error deleting club: {e}")
		return f"Error: {str(e)}", 500


# Logout
@app.route('/logout')
def logout():
	"""Logout user"""
	session.pop('username', None)
	return redirect('/login')


if __name__ == "__main__":
	import click

	@click.command()
	@click.option('--debug', is_flag=True)
	@click.option('--threaded', is_flag=True)
	@click.argument('HOST', default='0.0.0.0')
	@click.argument('PORT', default=8111, type=int)
	def run(debug, threaded, host, port):
		"""
		This function handles command line parameters.
		Run the server using:

			python server.py

		Show the help text using:

			python server.py --help

		"""

		HOST, PORT = host, port
		print("running on %s:%d" % (HOST, PORT))
		app.run(host=HOST, port=PORT, debug=debug, threaded=threaded)

run()
