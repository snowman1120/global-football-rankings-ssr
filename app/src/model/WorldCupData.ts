import { Group } from "./Group.js"

export class WorldCupData {
    
  static data = new WorldCupData()
  
  private worldCupGroups: Group[] = [];

  public setWorldGroups(groups: Group[]) {
    this.worldCupGroups = groups;
  }

  public getWorldGroups(): Group[] {
    return this.worldCupGroups;
  }
}