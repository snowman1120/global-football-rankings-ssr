import { SuperTeam } from "./SuperTeam.js";
export interface Group {
  title: string;
  teams: SuperTeam[];
  avgSPI: number;
  _avgSPI: string;
  // Add other properties as needed
}