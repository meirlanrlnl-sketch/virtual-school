export interface Panorama {
  name: string;
  image: string;
  hotspots: {
    yaw: number;
    pitch: number;
    label: string;
    destination?: number;
    information?: string;
    guide?: boolean;
  }[];
}
// Add licensed 2:1 images under public/assets/panoramas and configure them here.
export const panoramas: Panorama[] = [];
