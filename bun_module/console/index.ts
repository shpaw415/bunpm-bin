export async function Prompt({
  message,
  rule,
  errorMsg,
}: {
  message: string;
  rule?: (value: string) => Promise<boolean>;
  errorMsg?: string;
}) {
  console.write(`${message} > `);

  let count = 0;
  for await (const line of console) {
    const val = line.trim();
    if (rule && (await rule(val))) return val;
    else if (!rule) return val;
    else {
      console.log(errorMsg || "Error!");
      console.write(`${message} > `);
    }
  }
}

interface _colors {
  black: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  white: string;
  console_color: string;
}

export function colorConsoleText(text: string, color: keyof _colors = "black") {
  const colors: _colors = {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    console_color: "\x1b[0m",
  };
  const coloredText = `${colors[color]}${text}${colors.console_color}`;
  return coloredText;
}
