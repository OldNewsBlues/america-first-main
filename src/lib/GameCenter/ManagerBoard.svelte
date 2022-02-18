<script>
    import MatchScore from "./MatchScore.svelte";

    export let weekMatchups, week, matchSelection, completeGames, playersInfo, nflPlayerInfo, showGameBox, showMatchBox, yearSelection, weekSelection, currentYear, nflTeams;

    let matchScores = [];
    const matchesObj = {};

    const getMatchScores = (weekMatchups) => {
        matchScores = [];
        for(const matchup in weekMatchups) {
            const matchTeams = weekMatchups[matchup];
            let matchID = matchTeams[0].matchID; 

            let toPlay = {
                0: matchTeams[0].starters.length,
                1: matchTeams[1].starters.length,
            };
            if(yearSelection == currentYear && weekSelection == week) {
                for(let i = 0; i < matchTeams.length; i++) {
                    for(const starter of matchTeams[i].starters) {
                        if(starter == '0' || !playersInfo.players[starter].wi[week] || playersInfo.players[starter].wi[week].o == null || completeGames.includes(starter) || (playersInfo.players[starter].pos != 'DEF' && nflPlayerInfo[starter].espn.t[yearSelection].length == 1 && completeGames.includes(nflTeams.find(t => t.espnAbbreviation == nflPlayerInfo[starter].espn.t[yearSelection][0]).sleeperID)) || (playersInfo.players[starter].pos != 'DEF' && nflPlayerInfo[starter].espn.t[yearSelection].length > 1 && nflPlayerInfo[starter].espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection) && completeGames.includes(nflTeams.find(t => t.espnAbbreviation == nflPlayerInfo[starter].espn.t[yearSelection].find(w => w.firstWeek <= weekSelection && w.lastWeek >= weekSelection).team).sleeperID))) {
                            toPlay[i] --;
                        }
                    }
                }
            } else {
                toPlay[0] = 0;
                toPlay[1] = 0;
            }

            matchesObj[matchID] = {
                matchID,
                home: {
                    recordManID: matchTeams[0].recordManID,
                    fpts: matchTeams[0].totalFpts,
                    matchInfo: matchTeams[0],
                    rosterID: matchTeams[0].rosterID,
                    toPlay: toPlay[0],
                },
                away: {
                    recordManID: matchTeams[1].recordManID,
                    fpts: matchTeams[1].totalFpts,
                    matchInfo: matchTeams[1],
                    rosterID: matchTeams[1].rosterID,
                    toPlay: toPlay[1],
                },
                isComplete: false,
            }

            if(toPlay[0] == 0 && toPlay[1] == 0) matchesObj[matchID].isComplete = true;
            matchScores.push(matchesObj[matchID]);
        }
    }
    $: getMatchScores(weekMatchups);

</script>

<style>
    .scoresHolder {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        z-index: inherit;
        padding: 0.75em;
        margin: 0.5em;
        width: 16.75em;
        height: 100%;
        border-radius: 1em;
        justify-content: flex-start;
        align-items: center;
		box-shadow: inset 0px 3px 3px -2px rgb(0 0 0 / 30%), inset 0px 3px 4px 0px rgb(0 0 0 / 28%), inset 0px 1px 4px 3px rgb(0 0 0 / 30%);
        background-color: var(--gcBox);
    }
</style>

<div class="scoresHolder">
    {#each matchScores as {matchID, home, away, isComplete}} 
        <MatchScore  {matchID} {home} {away} {isComplete} bind:matchSelection={matchSelection} bind:showGameBox={showGameBox} bind:showMatchBox={showMatchBox} />
    {/each}
</div>