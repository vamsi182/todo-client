# Tally – Full Stack To-Do Application

A to-do app with user signup and login. Each user sees only their own tasks.
Built with **React + Redux Toolkit** on the front end and **Node.js + Express + MongoDB** on the back end, with **JWT** authentication.

## Live links

- **Live app:** https://todo-client-two-psi.vercel.app
- **API:** https://todo-server-dr3j.onrender.com (health check: `/api/health`)
- **GitHub:** https://github.com/vamsi182/todo-client

> The API runs on Render's free tier, so the first request after a period of inactivity can take 30–60 seconds while the server wakes up.

## Features

- Sign up and log in with email and password (passwords hashed with bcrypt)
- JWT sessions (7 days) that survive a page refresh
- Add, edit (double-click or **Edit**), complete, and delete tasks
- Priority (low / medium / high) shown as a colour edge on each task
- Optional due date, with overdue tasks flagged
- Filter by All / To do / Done, with a live "x of y done" count
- Protected routes on the client and a protected API on the server
- Responsive layout, visible keyboard focus, and clear validation messages

## Tech stack

| Layer     | Tools |
|-----------|-------|
| Front end | React 18, Redux Toolkit, React Router, Fetch API, HTML, CSS, Vite |
| Back end  | Node.js, Express, Mongoose |
| Database  | MongoDB Atlas |
| Auth      | JSON Web Tokens, bcryptjs |
| Hosting   | Vercel (client), Render (API), MongoDB Atlas (database) |

## Project structure

```
todo-app/
├── client/                  React app (Vite)
│   └── src/
│       ├── api.js           Fetch wrapper that attaches the JWT
│       ├── store/           Redux store, authSlice, todosSlice
│       ├── pages/           Auth (login + signup), Dashboard
│       ├── App.jsx          Routes and route guards
│       └── styles.css
└── server/                  Express API
    ├── server.js            App setup, CORS, DB connection
    ├── models/              User, Todo
    ├── middleware/auth.js   JWT verification
    └── routes/              auth.js, todos.js
```

## How it works

1. A user signs up or logs in. The API returns a JWT, which the client stores in `localStorage`.
2. `api.js` attaches the token as `Authorization: Bearer <token>` on every request.
3. On page load the client calls `/api/auth/me` to check the saved token.
4. Redux slices (`authSlice`, `todosSlice`) hold the user and task state and call the API with async thunks.
5. Every todo query on the server is filtered by the logged-in user's id.

## Run locally

**Prerequisites:** Node.js 18+ and a MongoDB database (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
# 1. API
cd server
cp .env.example .env        # then edit MONGO_URI and JWT_SECRET
npm install
npm run dev                 # http://localhost:5000

# 2. Client (new terminal)
cd client
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm install
npm run dev                 # http://localhost:5173
```

### Environment variables

`server/.env`

| Variable | Purpose |
|----------|---------|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Long random string used to sign tokens |
| `CLIENT_URL` | Allowed CORS origins, comma separated, no trailing slash |

Example:

```
CLIENT_URL=https://todo-client-two-psi.vercel.app,http://localhost:5173
```

`client/.env`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API address. `/api` is added automatically if missing |

## API reference

Base URL: `https://todo-server-dr3j.onrender.com/api`

All `/todos` routes need the header `Authorization: Bearer <token>`.

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| GET | `/health` | – | Server status |
| POST | `/auth/signup` | `name, email, password` | Create account, returns `{ token, user }` |
| POST | `/auth/login` | `email, password` | Log in, returns `{ token, user }` |
| GET | `/auth/me` | – | Current user (validates the token) |
| GET | `/todos` | – | List your tasks |
| POST | `/todos` | `title, priority?, dueDate?` | Create a task |
| PUT | `/todos/:id` | any of `title, completed, priority, dueDate` | Update a task |
| DELETE | `/todos/:id` | – | Delete a task |

Example:

```bash
curl -X POST https://todo-server-dr3j.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

## Deployment

1. **Database:** create a MongoDB Atlas cluster and a database user. Under **Network Access** add `0.0.0.0/0` so Render can connect.
2. **API (Render):** root directory `server`, build command `npm install`, start command `npm start`. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`.
3. **Client (Vercel):** root directory `client`, build command `npm run build`, output directory `dist`. Set `VITE_API_URL` to `https://todo-server-dr3j.onrender.com/api`. A `vercel.json` rewrite sends all paths to `index.html`, so refreshing `/login` works.

## Security notes

- Passwords are hashed with bcrypt and never returned by the API.
- Every todo query is scoped to the logged-in user, so users cannot read or change each other's tasks.
- CORS only allows the origins listed in `CLIENT_URL`.
- `.env` files are git-ignored. Use a strong `JWT_SECRET`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Could not reach the server" | The Render service may be asleep; wait a minute and retry |
| CORS error in the browser | `CLIENT_URL` on Render must match your site URL exactly (no trailing slash) |
| 404 on `/auth/login` | The API URL is missing `/api` |
| `MongoDB connection failed: bad auth` | Wrong database username or password in `MONGO_URI` |
| `Could not connect to any servers` | Add `0.0.0.0/0` in Atlas Network Access |

## Possible next steps

Password reset by email, drag-to-reorder, tags, and automated tests.
