import { AbstractCommand } from "@/controllers/abstract/AbstractCommand";
import type {
  CommandControllerMap,
  MethodNames,
  CommandPayload,
} from "../types/command.types";

// Type for registered commands
type RegisteredCommands = Map<string, AbstractCommand<any>>;

// 전역으로 Command 패턴을 적용하기 위한 매니저
export class CommandManager {
  private static instance: CommandManager;
  private readonly commands: RegisteredCommands = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  private init() {}

  public registerCommand<T extends AbstractCommand<any>>(command: T): void {
    this.commands.set(command.name, command);
  }

  public unregisterCommand(commandName: string): void {
    this.commands.delete(commandName);
  }

  public clearAllCommands(): void {
    this.commands.clear();
  }

  // Type-safe command execution with overloads
  public command<
    TCommand extends keyof CommandControllerMap,
    TMethod extends MethodNames<TCommand>,
  >(
    commandName: TCommand,
    methodName: TMethod,
    payload: CommandPayload<TCommand, TMethod>,
  ): void;

  // Fallback for dynamic usage (maintains backward compatibility)
  public command(
    commandName: string,
    methodName: string,
    payload: unknown,
  ): void;

  public command(
    commandName: string,
    methodName: string,
    payload: unknown,
  ): void {
    const command = this.commands.get(commandName);

    console.log("Frontend:CommandManager", "command", command);

    if (!command) {
      throw new Error(`Command not found: ${commandName}`);
    }

    // Type assertion is safe here because we're using the overloaded signatures
    (command as any).execute(methodName, payload);
  }
}
