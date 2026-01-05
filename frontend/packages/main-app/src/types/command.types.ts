/**
 * Utility types for extracting controller methods and creating type-safe commands
 */

// Extract public methods from a controller class
export type ExtractMethods<T> = {
	[K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K];
};

// Extract method parameters
export type MethodParams<T> = T extends (...args: infer P) => any ? P : never;

// Extract first parameter of a method (usually the payload)
export type FirstParam<T> = T extends (arg: infer P, ...args: any[]) => any
	? P
	: never;

// Map of registered commands and their controllers
// biome-ignore lint/suspicious/noEmptyInterface: <explanation>
export interface CommandControllerMap {}

// Extract available methods for a command
export type CommandMethods<T extends keyof CommandControllerMap> =
	ExtractMethods<CommandControllerMap[T]>;

// Get method names for a command
export type MethodNames<T extends keyof CommandControllerMap> =
	keyof CommandMethods<T> & string;

// Get payload type for a specific command and method
export type CommandPayload<
	T extends keyof CommandControllerMap,
	M extends MethodNames<T>,
> = CommandMethods<T>[M] extends (...args: any[]) => any
	? FirstParam<CommandMethods<T>[M]>
	: never;
