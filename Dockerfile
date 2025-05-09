# Use the official Node.js image AS the base image
FROM node:23.7-alpine AS app-base

# Create a non-root user
RUN adduser -D -h /home/app -s /bin/sh app

# Set install paths for install directory
ENV NPM_CONFIG_PREFIX=/home/app/.npm-global
ENV PATH=$PATH:/home/app/.npm-global/bin

# Set the working directory inside the container
WORKDIR /app

# Change ownership of the working directory to the non-root user
RUN chown -R app:app /app

# Switch to the non-root user
USER app

# Copy package.json and package-lock.json to the working directory
COPY --chown=app:app package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY --chown=app:app . .

FROM app-base AS prod-build

# Build the Next.js app
RUN ./node_modules/.bin/prisma generate && npm run build

# Expose the port that the app will run on
EXPOSE 3000

# Define the command to start the app
ENTRYPOINT [ "/bin/sh", "-c" ]
CMD ["./node_modules/.bin/prisma migrate deploy && npm start"]


FROM postgres:16.2-alpine AS db

ADD db/*.sh /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/*sh