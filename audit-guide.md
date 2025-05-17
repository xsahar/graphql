# GraphQL Project Audit Guide

This document helps locate the relevant files and features to evaluate during project audits.

## Functional Requirements Verification

### Authentication
- **Login with invalid credentials**:
  - Test in `index.html` with the login form
  - Error handling in `js/authform.js` (lines 43-85)
  - Errors appear in the `#errorMessage` element

### Profile Sections
- **Required sections**:
  - Header section: `index.html` (lines 54-61)
  - Developer Profile: `index.html` (lines 64-70)
  - Performance Metrics: `index.html` (lines 73-87)

### Data Accuracy
- **GraphQL query**:
  - Main query in `js/graphql.js` (lines 33-60)
  - Data processing in `js/profile.js` (lines 32-76)
  - User data fields: login, firstName, lastName, email, auditRatio, totalUp, totalDown, transactions, results

### Graphical Statistics
- **SVG graphs**:
  - Chart implementation in `js/charts.js`
  - Audit Ratio Pie Chart: function `drawAuditRatioPieChart()` (lines 17-85)
  - XP by Project Bar Chart: function `drawXPByProjectGraph()` (lines 88-303)
  - Both charts use SVG elements created with the DOM API
  - Interactivity includes tooltips and hover effects

### Profile Access & Authentication
- **Login functionality**:
  - Authentication process in `js/auth.js` and `js/authform.js`
  - JWT token handling in `js/sessionManager.js`

- **Logout functionality**:
  - Event listener in `js/main.js` (lines 10-15)
  - Implementation in `js/auth.js` (lines 24-27)

## GraphQL Implementation Requirements

### Query Types
- **Basic queries**:
  - User information query in `js/graphql.js` (lines 35-44)

- **Nested queries**:
  - Transactions and results are nested within user in `js/graphql.js` (lines 45-59)

- **Queries with arguments**:
  - User lookup by ID: `user_by_pk(id: $userId)` in `js/graphql.js` (line 35)
  - Results filtering: `where: { grade: { _is_null: false } }` in `js/graphql.js` (line 52)
  - Sorting: `order_by: { createdAt: asc }` in `js/graphql.js` (line 53)

### Data Processing
- XP calculation in `js/profile.js` (lines 82-97)
- Project data processing in `js/profile.js` (lines 100-133)

## How to Test

1. **Authentication**:
   - Try logging in with incorrect credentials
   - Check for appropriate error messages
   - Log in with valid credentials

2. **Profile Data**:
   - Verify user information displayed matches GraphiQL query results
   - Check audit ratio accuracy
   - Validate XP calculations

3. **Graphs**:
   - Interact with the SVG charts
   - Hover to see tooltips and details
   - Verify data matches transactions from GraphQL query

4. **Logout**:
   - Click the logout button
   - Verify redirect to login page
   - Check that protected data is no longer accessible