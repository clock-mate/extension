# Setup the development environment

Clone the repository and enter the project directory:

```bash
git clone https://github.com/clock-mate/extension.git
cd extension
```

## Nix

This project includes a `flake.nix` file with a `devShell`. To enter the development environment, run:

```bash
nix develop
```

If you have `direnv` setup, simply run:

```bash
direnv allow
```

Once inside the development environment, install all the node dependencies:

```bash
npm install
```

## Manual

Install the following tools manually:
- [git](https://git-scm.com/)
- [node.js](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/)

Altenatively, you can use [nvm](https://github.com/nvm-sh/nvm) to manage the node version.
The project includes a `.nvmrc` file which specifies the node version to use. With `nvm` installed, you can run:

```bash
nvm use
```

Then install the node dependencies:

```bash
npm install
```

# Build the Extension

Before building, create a `url.json` file in the `src/extension/contentscript` directory.
This file should contain the URL of your Fiori server, for example:

```json
"https://abc.cdef.domain.com:1234"
```

To build the extension, run:

```bash
npm run build
```

The built extension will be placed in the `build` directory.
