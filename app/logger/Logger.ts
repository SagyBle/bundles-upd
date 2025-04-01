export class Logger {
  private static formatTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, "0");

    const day = pad(now.getDate());
    const month = pad(now.getMonth() + 1);
    const year = now.getFullYear();
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());
    const seconds = pad(now.getSeconds());

    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`;
  }

  private static format(level: string, message: any) {
    return `[${this.formatTimestamp()}] [${level}] ${message}`;
  }

  static info(message: any) {
    console.log(this.format("INFO", message));
  }

  static warning(message: any) {
    console.log(this.format("WARNING", message));
  }

  static error(message: any) {
    console.log(this.format("ERROR", message));
  }

  static critical(message: any) {
    console.log(this.format("CRITICAL", message));
  }

  // Default log is info
  static log(message: any) {
    this.log(message);
  }
}
