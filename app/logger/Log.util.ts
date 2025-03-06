export enum LogLevel {
  DEBUG = 1,
  INFO = 2,
  WARNING = 3,
  ERROR = 4,
  NONE = 5,
}

export class Log {
  private static currentLevel: LogLevel = LogLevel.DEBUG; // Default log level
  private static defaultFileName: string = ""; // Default if not set

  static setLogLevel(level: LogLevel): void {
    this.currentLevel = level;
  }

  static setFileName(fileName: string): void {
    this.defaultFileName = fileName;
  }

  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  private static shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private static logMessage(
    level: string,
    functionName: string,
    message: string,
    ...optionalParams: any[]
  ): void {
    console.log(
      `[${level}] [${this.getTimestamp()}] [${this.defaultFileName}.${functionName}] ${message}`,
      ...optionalParams,
    );
  }

  static info(
    functionName: string,
    message: string,
    ...optionalParams: any[]
  ): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.logMessage("INFO", functionName, message, ...optionalParams);
    }
  }

  static error(
    functionName: string,
    message: string,
    ...optionalParams: any[]
  ): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.logMessage("ERROR", functionName, message, ...optionalParams);
    }
  }

  static warning(
    functionName: string,
    message: string,
    ...optionalParams: any[]
  ): void {
    if (this.shouldLog(LogLevel.WARNING)) {
      this.logMessage("WARNING", functionName, message, ...optionalParams);
    }
  }

  static debug(
    functionName: string,
    message: string,
    ...optionalParams: any[]
  ): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.logMessage("DEBUG", functionName, message, ...optionalParams);
    }
  }
}
