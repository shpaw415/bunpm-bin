type _create = Array<{
  mainArg: string;
  description: string;
  options?: Array<{
    argName: string;
    description: string;
  }>;
}>;

interface AppMetaData {
  version: string;
  name: string;
}

export class argParser {
  private setter: _create = [];
  private argPairs: { [key: string]: string } = {};
  private mainArg: string | undefined;
  private currentVersion: string = "";
  private appName: string = "";

  public create(value: _create) {
    this.setter = value;
    return this;
  }
  /**
   *
   * @param version version of the app
   * @param name name of the app
   */
  public setParams({ version, name }: AppMetaData) {
    this.currentVersion = version;
    this.appName = name;
    return this;
  }
  public parse() {
    let args = Bun.argv.slice(2);
    const versionSyntaxes = ["-v", "--v", "--version"];
    if (args.includes("--help")) this.throwHelp();
    if (versionSyntaxes.includes(args[0])) this.throwVersion();

    if (args.length < 1) return;

    if (!args[0].startsWith("--")) {
      this.mainArg = args[0].replace("--", "");
      args = args.slice(1);
    }

    let currentKey = this.mainArg || "";
    args.map((arg) => {
      if (arg.startsWith("--")) {
        const val = arg.slice(2);
        if (this.argPairs[val]) {
          throw new Error("argument " + val + "already set");
        }
        this.argPairs[val] = "";
        currentKey = val;
        return;
      }
      this.argPairs[currentKey] = arg;
    });
    if (this.mainArg) {
      this.setter;
    }
    return this;
  }
  public get(name: string) {
    return this.argPairs[name] as string | undefined;
  }
  public getMainArg() {
    return this.mainArg;
  }
  public throwHelp() {
    console.log(" --- Help Menu ---\n\n -- Name --\t-- Description --\n");
    this.setter.map((val) => {
      console.log(
        ` -------------------------------------\n${val.mainArg}\t\t||\t${val.description}\n`
      );
      val.options?.map((opt) => {
        console.log(
          ` --${opt.argName}${opt.argName.length < 6 ? "\t" : ""}\t--\t${
            opt.description
          }\n`
        );
      });
      console.log(" -------------------------------------");
    });
    process.exit(0);
  }
  public throwVersion() {
    console.log(`${this.appName} - Version: ${this.currentVersion}`);
    process.exit(0);
  }
}
