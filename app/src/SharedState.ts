import { Ranking } from "./model/Ranking.js";
import { AllDataTeamType } from "./model/AllDataTeamType.js";
import { SuperTeam } from "./model/SuperTeam.js";

export class SharedState {
  private static alternativeRanking: [string, number][] = [];

  private state: Ranking[] = [];
  private time: number = 0;

  public static readonly clubState = new SharedState();
  public static readonly internationalState = new SharedState();

  getState(): Ranking[] {
    return this.state;
  }

  getStateAndLastUpdatedDateString(): [Date, Ranking[]] {
    return [new Date(this.time * 1000), this.getState()];
  }

  submitNewData(rankings: Ranking[], rawData: AllDataTeamType): void {
    this.state = rankings;
    this.time = rawData.time;
  }

  info(identifier: string): Ranking | undefined {
    return this.getState().find((rank) => rank.uniqueID === identifier);
  }

  team(teamID: string): SuperTeam | undefined {
    return this.state.flatMap(rank => rank.teams).find(superTeam => superTeam.team.name === teamID);
  }
}