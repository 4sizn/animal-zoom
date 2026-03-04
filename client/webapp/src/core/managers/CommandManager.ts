import { AbstractCommand } from "../abstract/AbstractCommand";

type RegisteredCommands = Map<string, AbstractCommand<any>>;

export class CommandManager {
	private static instance: CommandManager;
	private readonly commands: RegisteredCommands = new Map();

	private constructor() {}

	public static getInstance(): CommandManager {
		if (!CommandManager.instance) {
			CommandManager.instance = new CommandManager();
		}
		return CommandManager.instance;
	}

	public registerCommand<T extends AbstractCommand<any>>(command: T): void {
		this.commands.set(command.name, command);
	}

	public unregisterCommand(commandName: string): void {
		this.commands.delete(commandName);
	}

	public clearAllCommands(): void {
		this.commands.clear();
	}

	public command(
		commandName: string,
		methodName: string,
		payload: unknown,
	): unknown {
		const command = this.commands.get(commandName);
		if (!command) {
			throw new Error(`Command not found: ${commandName}`);
		}
		return (command as any).execute(methodName, payload);
	}
}
