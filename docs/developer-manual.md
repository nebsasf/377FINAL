Developer Manual
Installation and Setup
 First I Get the files  Download or clone the project folder to your computer.

Install Dependencies Open a terminal in the project folder and type:
npm install

 When I built this, I found that the VS Code terminal often blocks scripts from running. To fix this, you must Override the computer's security settings:= which took a while 

Open the Start menu and search for PowerShell.

Right-click it and select Run as Administrator.

Type this command and hit Enter: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Type Y and hit Enter when asked.
Now you can go back to your project and run commands normally.

Environment Variables: Create a file named .env in the root folder. 
credentials here is like this 
SUPABASE_URL = your_supabase_link_here
SUPABASE_KEY = your_supabase_anon_key_here

How to Run the App
Start the Express Server In your terminal, type:
npm start

View the Website: Open your browser and go to
http://localhost:3000

Note: Do not use the Go Live button in VS Code. It will not connect to the database. You must use the npm start command and the localhost link.

Database Configuration
You need to set up two tables in your Supabase SQL Editor for the app to function:

The Opportunities Table:
This table holds the data for the map pins. It needs columns for: title, organization, category, description, city, state, latitude, and longitude.

The Volunteer Table 
This table stores the form sign-ups. Make sure the table is named volunteer ( and has these columns: first_name, last_name, email, city, state, and skills.

Manual Testing Results
I verified the application is working through these steps:

Confirmed the terminal displays Received opportunities to ensure the database link is active.

Checked that all pins appear on the map after the page loads.

Tested the Join SkillServe form. After clicking submit, I checked my Supabase dashboard and confirmed the new volunteer data was successfully saved in the rows.

Future Development
If I had more time, I would add:

A login system for volunteers to track their hours.

A Search bar to find opportunities by keyword.

Better weather integration that shows icons based on the current forecast.

A nicer user interface 

Most importantly I would have a alot more data and opertunitys 