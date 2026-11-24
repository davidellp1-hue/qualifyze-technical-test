# Official Playwright image: Chromium, Firefox, WebKit and their system dependencies.
# Keep the tag in sync with the @playwright/test version in package.json.
FROM mcr.microsoft.com/playwright:v1.65.1-noble

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

ENTRYPOINT ["npx", "playwright", "test", "-c", "src/config/playwright.config.ts"]
