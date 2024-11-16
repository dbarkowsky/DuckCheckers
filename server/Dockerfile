#############################################
#                 Base                #
#############################################
# Use an official Node.js runtime as a base image
FROM oven/bun:1 as base

# Set the working directory in the container
WORKDIR /express-api

ENV CONTAINERIZED=true

# Copy files, excluding those in .dockerignore
COPY . .

# Install packages. Needed for build process.
RUN bun i

# Compile to JavaScript build 
ENTRYPOINT bun run --hot index.ts
