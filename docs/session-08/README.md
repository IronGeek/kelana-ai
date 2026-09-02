# Session 8
   
Teaching KelanaAI to Know Its Users:

## Assignments

- [x] View: Only own trips
  - [x] The GET /trips endpoint has filtered data based on the user_id of the currently logged in user.
  - [x] Users can only view their own trips.
- [x] Update: Reject other users'' trips 
  - [x] Secure data update endpoints.
  - [x] endpoint PUT /trips/{id}, make sure the system rejects requests to change other people's trips.
  - [x] Return error status 403 (Forbidden) if user_id does not match.
- [x] Delete: Reject other users'' trips Secure data deletion endpoint.
  - [x] On the DELETE /trips/{id} endpoint, ensure the system rejects the delete request if the user_id does not match,
  - [x] Return error status 403 (Forbidden).
- [x] Register + Login Page
  - [x] Create custom user interface (UI) pages for new account Registration and user Login processes.
- [x] Route Protection
  - [x] Ensure that the generate trip, trip list, trip detail, and profile pages are fully protected and can only be accessed after the user has successfully logged in.
  - [x] If a user who is not logged in tries to access these pages, automatically redirect them back to the login page.
- [x] Trip List Display Filter
  - [x] Ensure that the trip list page in the interface (frontend) only contains and displays a list of trips belonging to the logged-in user.
- [x] Git & Version Control Save all changes from your solution (Commit and push your solution) to the GitHub repository

## Repository

https://github.com/IronGeek/kelana-ai/commits/session-7
