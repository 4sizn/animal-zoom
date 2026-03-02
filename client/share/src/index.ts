export interface ZoomAnimal {
  id: string;
  name: string;
  imageUrl: string;
}

export interface ZoomParticipantMediaState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isSpeaking: boolean;
}

export interface ZoomParticipant {
  animal: ZoomAnimal;
  mediaState: ZoomParticipantMediaState;
}

export interface ZoomPosition {
  x: number;
  y: number;
  scale: number;
}

export interface ZoomState {
  animalId: string;
  position: ZoomPosition;
}

export interface User {
  id: number;
  email: string;
  createdAt: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface RegisterResponse {
  ok: boolean;
  user?: User;
  error?: string;
}

export interface AuthResponse {
  ok: boolean;
  accessToken?: string;
  user?: User;
  error?: string;
}
