export async function Prompt({
  message,
  rule,
}: {
  message: string;
  rule?: (value: string) => Promise<boolean>;
}) {
  console.write(`${message} > `);

  let count = 0;
  for await (const line of console) {
    const val = line.trim();
    if (rule && (await rule(val))) return val;
    else if (!rule) return val;
  }
}
