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
