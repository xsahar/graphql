# GraphQL Profile Dashboard

A personal profile dashboard built with GraphQL and vanilla JavaScript that displays student information, performance metrics, and interactive data visualizations using SVG.

## Features

- **Secure Authentication**: Login with username/email and password using JWT
- **Profile Information**: Display user details including username, email, and audit ratio
- **XP Tracking**: Calculate and display total XP with proper formatting
- **SVG Data Visualizations**: Interactive graphs showing:
  - Audit ratio as a pie chart
  - XP by project as a bar chart
- **Responsive Design**: Clean modern UI with responsive layout

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: JWT with secure token management
- **Data Fetching**: GraphQL API queries
- **Data Visualization**: SVG-based interactive charts
- **API Integration**: GraphQL endpoint integration

## Project Structure

- `index.html` - Main application page with both login and profile sections
- `css/` - Styling for the application
- `js/`
  - `auth.js` - Authentication handling
  - `authform.js` - Login form submission
  - `charts.js` - SVG chart generation
  - `graphql.js` - GraphQL query execution
  - `main.js` - Main application initialization
  - `profile.js` - Profile data handling
  - `sessionManager.js` - JWT token management
  - `utils.js` - Helper functions

## How to Use

1. Open the application in your browser
2. Log in with your credentials
3. View your profile information and performance metrics
4. Interact with the SVG charts to explore your data
5. Log out when finished

## GraphQL Implementation

The application uses three types of GraphQL queries:
- Basic queries to fetch user information
- Nested queries to retrieve related data
- Parameterized queries with arguments for filtering data

## Security Features

- JWT token validation and expiration handling
- Secure authentication with error handling
- Protected GraphQL queries with authorization headers

## Future Enhancements

- Additional data visualizations
- Timeline view of progress
- Dark/light theme toggle
- Performance optimization for larger datasets