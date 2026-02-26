export interface ZoomAnimal {
  id: string;
  name: string;
  imageUrl: string;
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
