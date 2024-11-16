FROM oven/bun:1 as base

# Set the working directory in the container
WORKDIR /app

ENV CONTAINERIZED=true

# Copy files, excluding those in .dockerignore
COPY . .

# Install packages. Needed for build process.
RUN bun i

RUN bun run build

EXPOSE 4173

# Compile to JavaScript build 
ENTRYPOINT bun run preview --host
