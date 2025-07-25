ARG VARIANT="22-bookworm"
FROM mcr.microsoft.com/devcontainers/typescript-node:1-${VARIANT}

# Set working directory
WORKDIR /app

# Change ownership of the working directory to node user
RUN chown -R node:node /app
USER node

# Copy package files
COPY --chown=node:node package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY --chown=node:node . .

# Expose the port
EXPOSE 3000

# Start the application
# CMD ["npm", "run", "dev"]
CMD ["tail", "-f", "/dev/null"]
