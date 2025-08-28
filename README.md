## Cars Ads API (Node.js + Express + PostgreSQL)

### Features
- Cars CRUD endpoints:
  - GET `/cars` – list all cars
  - POST `/cars` – create car (multipart form, field `image` for photo)
  - GET `/cars/:id` – get car by id
  - DELETE `/cars/:id` – delete car
- Image upload via Multer to the `uploads/` directory
- Static serving at `/uploads/...` and absolute image URLs in responses

### Setup
1. Copy environment template and edit values:
```bash
cp .env.example .env
```

2. Ensure PostgreSQL is running and a database exists that matches `.env`.

3. Install deps and start:
```bash
npm install
npm run dev
```

Server defaults to `http://localhost:3000`.

The server will attempt to create the `cars` table on startup (non-fatal if DB is unavailable).

### Cars table
```sql
CREATE TABLE IF NOT EXISTS cars (
  id SERIAL PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  km INTEGER NOT NULL,
  city TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API usage

Create car with image:
```bash
curl -X POST http://localhost:3000/cars \
  -F make=Toyota -F model=Corolla -F year=2018 -F price=55000 \
  -F km=65000 -F city=Tel-Aviv \
  -F image=@/path/to/car.jpg
```

List cars:
```bash
curl http://localhost:3000/cars
```

Get by id:
```bash
curl http://localhost:3000/cars/1
```

Delete:
```bash
curl -X DELETE http://localhost:3000/cars/1
```
