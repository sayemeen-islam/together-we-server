# Together We — Backend

Together We is a community-driven social development events platform that connects people through local community service activities. This repository contains the backend API responsible for event management, user participation, and secure API access.

## 🛠️ Technologies Used

- Node.js
- Express.js
- MongoDB
- Better Auth JWT
- JSON Web Key Sets (JWKS)

## ✨ Key Features

- **Event Management:** Create, retrieve, update, and delete community events.
- **Upcoming Events:** Fetch upcoming events sorted by event date.
- **Recent Events:** Retrieve the latest 6 upcoming events for the homepage using MongoDB's `.limit()` method.
- **Event Details:** Fetch individual event details along with the participant count.
- **Join Events:** Allow authenticated users to participate in community events.
- **Joined Events:** Retrieve events joined by the authenticated user, sorted by event date.
- **Manage Events:** Allow users to retrieve, update, and delete only their own events.
- **JWT Authentication:** Verify authentication tokens using the Better Auth JWKS endpoint.
- **Input Validation:** Validate event dates and event IDs, prevent duplicate participation, and handle errors with appropriate HTTP status codes.

## 📡 API Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | Check server status | Public |
| GET | `/events` | Get all upcoming events | Public |
| GET | `/events/recent` | Get the 6 most recent upcoming events | Public |
| GET | `/event/:id` | Get event details with participant count | Public |
| POST | `/events/create` | Create a new event | Protected |
| POST | `/join` | Join an event | Protected |
| GET | `/joined-events` | Get the user's joined events | Protected |
| GET | `/manage-events` | Get events created by the user | Protected |
| PATCH | `/manage-events/:id` | Update an event created by the user | Protected |
| DELETE | `/manage-events/:id` | Delete an event created by the user | Protected |

## 🔐 Authentication & Security

- Protected API routes require a valid JWT.
- JWT tokens are verified using the Better Auth JWKS endpoint.
- User identity is extracted from the verified token.
- Event ownership is checked before allowing updates or deletions.
- Duplicate event participation is prevented.
- Invalid event IDs and missing resources are handled with appropriate error responses.

## 🔗 Related Links

- **Live Website:** https://togetherwe-connect.vercel.app/
- **Frontend Repository:** https://github.com/sayemeen-islam/together-we

---

Built for Together We — Making a Difference Together.
