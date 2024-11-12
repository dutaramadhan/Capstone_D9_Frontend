# Gunakan image Node.js sebagai base image
FROM node:18-alpine AS builder

# Tentukan direktori kerja dalam container
WORKDIR /app

# Salin file package.json dan package-lock.json untuk instalasi dependensi
COPY package.json package-lock.json ./

# Install dependensi
RUN npm install

# Salin semua file proyek ke dalam container
COPY . .

# Build aplikasi Next.js
RUN npm run build

# Produksi: Gunakan image minimal untuk menjalankan aplikasi
FROM node:18-alpine AS runner

# Tetapkan direktori kerja
WORKDIR /app

# Salin output build dari tahap builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Install dependensi produksi
RUN npm install --only=production

# Tentukan port yang akan digunakan oleh aplikasi
EXPOSE 3000

# Jalankan aplikasi Next.js
CMD ["npm", "run", "start"]
