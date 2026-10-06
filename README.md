# Academia Flora

## Local development

### Backend
Open `backend` in Spring Tools for Eclipse / Eclipse and run `AcademiaFloraApplication.java`.
Check: `http://localhost:8080/api/health` -> `{"status":"UP"}`.

### Frontend
From `frontend`:

```bash
npm install
npm run dev
```

For local frontend, `VITE_API_URL=http://localhost:8080`.

## GitHub + Netlify + Render

1. Push the whole repository to GitHub (do not commit `node_modules`, `dist`, `target`, or `.env`).
2. Deploy the `backend` service on Render using the included `backend/render.yaml` or Dockerfile.
3. After Render gives the backend URL, set this Netlify environment variable:
   `VITE_API_URL=https://YOUR-BACKEND.onrender.com`
4. Redeploy Netlify.
5. Test `https://YOUR-BACKEND.onrender.com/api/health` before testing login.

Demo credentials:
- Student: `student@college.edu` / `Student@123`
- Faculty: `faculty@college.edu` / `Faculty@123`
