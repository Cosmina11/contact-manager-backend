Pentru rularea proiectului, este necesar un cont de Google Cloud Platform. Vom crea un proiect nou si vom activa Google People API din API Library,
iar din Credentials vom salva Client ID si Client Secret pentru a le adauga ultetior in .env, 
si vom seta URL-ul pe care ruleaza proiectul si URL-urile de redirectionare. Este necesara o conexiune la MongoDB local, o versine de Node.js si
Postman pentru a testa rutele. 

Configurarea fisierului .env:


DB_HOST=localhost
DB_PORT=5432
DB_NAME=database
JWT_SECRET= //il generam random
GOOGLE_CLIENT_ID= //folosim client id-ul din Google Cloud Platform
GOOGLE_CLIENT_SECRET= //folosim client secret din Google Cloud Platform
GOOGLE_REDIRECT_URL= http://localhost:5001/api/auth/google/callback
PORT=5001
MONGODB_URI=mongodb://localhost:27017/cerinte-db

In terminal rulam:
npm i
npm run dev

Dupa ce am pornit server-ul, vom accesa urmatoarele rute in Postman astfel:

- Autentificare: 
GET localhost:5001/api/auth/google -> folosim raspunsul pentru a conecta contul Google la aplicatie. Salvam token-ul primit prin http://localhost:5001/api/auth/google/callback

- Sincronizare:
POST   /api/sync - pentru a sincroniza contactele 

- Contacte
GET    /api/contacts - afisam contactele
POST   /api/contacts - creare contact
PUT    /api/contacts/:id - modificare contact
DELETE /api/contacts/:id - stergere contact

