# Interactive Map Project

An Angular application that allows users to enter an address in a form and view the location on Google Maps.

## Features

- Address input form
- Google Maps integration with geocoding
- Responsive layout with form on the left and map on the right
- **Shared data storage via GitHub** - All users see each other's edits in real-time
- Admin interface for data management
- Nonprofit-friendly free storage solution

## Prerequisites

- Node.js (LTS version recommended)
- Angular CLI

## Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Obtain a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
4. Replace `YOUR_API_KEY` in `src/index.html` with your actual API key
5. Run `ng serve` to start the development server
6. Navigate to `http://localhost:4200/`

## Shared Data Storage (GitHub Sync)

To enable real-time data synchronization across all users:

1. Follow the setup guide in [GITHUB_SETUP.md](GITHUB_SETUP.md)
2. Enter your GitHub credentials in Admin Mode
3. All edits will now be saved to a shared GitHub repository
4. All users see each other's changes immediately

**Benefits:**
- ✅ 100% free (no credits needed)
- ✅ Works for nonprofits
- ✅ Professional-grade security
- ✅ All users see the same data
- ✅ Complete edit history

For detailed instructions, see [GITHUB_SETUP.md](GITHUB_SETUP.md)

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more information on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.