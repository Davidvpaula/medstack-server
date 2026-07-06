const colors = {
  reset: "\x1b[0m",
  blue: "\x1b[34m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m"
};

function now() {
  return new Date().toLocaleString("pt-BR");
}

function format(level, message) {
  return `${colors.gray}[${now()}]${colors.reset} ${level} ${message}`;
}

export const logger = {
  info(message) {
    console.log(format(`${colors.blue}[INFO]${colors.reset}`, message));
  },

  success(message) {
    console.log(format(`${colors.green}[SUCCESS]${colors.reset}`, message));
  },

  warn(message) {
    console.log(format(`${colors.yellow}[WARN]${colors.reset}`, message));
  },

  error(message, error = null) {
    console.error(format(`${colors.red}[ERROR]${colors.reset}`, message));

    if (error) {
      console.error(error);
    }
  }
};