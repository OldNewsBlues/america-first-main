import { round, waitForAll, leagueID, getLeagueData } from '$lib/utils/helper'; 

export async function get() {

    let curSeason = leagueID;
    const leagueDataArray = [];

    // get NFL state from sleeper (week and year)
    const [nflStateRes, leagueDataRes, playoffsRes] = await waitForAll(
        fetch(`https://api.sleeper.app/v1/state/nfl`, {compress: true}),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}`, {compress: true}),
        fetch(`https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`, {compress: true}),
    )
    
    const [nflState, leagueData, playoffs] = await waitForAll(
        nflStateRes.json(),
        leagueDataRes.json(),
        playoffsRes.json(),
    )

    if(leagueDataArray.length == 0) {
        leagueDataArray.push({
            year: parseInt(leagueData.season),
            fullSeasonLength: leagueData.settings.playoff_week_start - 1 + playoffs.pop().r,
            leagueID: curSeason,
            score: leagueData.scoring_settings,
        });
        curSeason = leagueData.previous_league_id;

        while (curSeason && curSeason != 0) {
            let previousLeagueData = await getLeagueData(curSeason).catch((err) => { console.error(err); });
            let previousPlayoffsRes = await fetch(`https://api.sleeper.app/v1/league/${curSeason}/winners_bracket`, {compress: true});
            let previousPlayoffs = await previousPlayoffsRes.json();

            leagueDataArray.push({
                year: parseInt(previousLeagueData.season),
                fullSeasonLength: previousLeagueData.settings.playoff_week_start - 1 + previousPlayoffs.pop().r,
                leagueID: curSeason,
                score: previousLeagueData.scoring_settings,
            });
            curSeason = previousLeagueData.previous_league_id;
        }
    }

    const resPromises = [
        fetch(`https://api.sleeper.app/v1/players/nfl`, {compress: true})
    ];

    for(let i = 0; i < leagueDataArray.length; i++) {

        for(let week = 1; week <= leagueDataArray[i].fullSeasonLength; week++) {
            resPromises.push(
                fetch(`https://api.sleeper.app/projections/nfl/${leagueDataArray[i].year}/${week}?season_type=regular&position[]=DB&position[]=DEF&position[]=DL&position[]=FLEX&position[]=IDP_FLEX&position[]=K&position[]=LB&position[]=QB&position[]=RB&position[]=REC_FLEX&position[]=SUPER_FLEX&position[]=TE&position[]=WR&position[]=WRRB_FLEX&order_by=ppr`, {compress: true})
            );
        }
    }
	
	const responses = await waitForAll(...resPromises);

    const resJSONs = [];
    for(const res of responses) {
        if(!res.ok) {
            return {
                status: 500,
                body: "No luck"
            };
        }
        resJSONs.push(res.json());
    }

    const weeklyData = await waitForAll(...resJSONs);

    const playerData = weeklyData.shift(); // first item is all player data, remaining items are weekly data for projections
        
    const computedPlayers = computePlayers(playerData, weeklyData, leagueDataArray);

    return {
        status: 200,
        body: JSON.stringify(computedPlayers)
    };
}

const computePlayers = (playerData, weeklyData, leagueDataArray) => {
    const computedPlayers = {};

    // create non weekly dependent player info
    for(const id in playerData) {
        const projPlayer = playerData[id];
        const player = {
            // injury_notes: projPlayer.injury_notes,
            fn: projPlayer.first_name,
            ln: projPlayer.last_name,
            pos: projPlayer.position,
            espnID: projPlayer.espn_id,
            wi: {},
        };
        if(projPlayer.team) player.t = projPlayer.team;
        if(projPlayer.team && projPlayer.injury_status) player.is = projPlayer.injury_status;
        computedPlayers[id] = player;
    }

    computedPlayers["OAK"] = computedPlayers["LV"];

    // add weekly projections
    for(let week = 1; week <= weeklyData.length; week++) {
        for(const player of weeklyData[week - 1]) {
            const id = player.player_id;
            
            // check if the player is active in the NFL
            if(!player.stats) continue;
            if(!computedPlayers[id].wi[player.season]) computedPlayers[id].wi[player.season] = {};
            computedPlayers[id].wi[player.season][player.week] = {
                p: calculateProjection(player.stats, leagueDataArray.find(d => d.year == player.season).score),
                o: player.opponent,
                t: player.team,
            }
        }
    }
    
    return computedPlayers;
}

const calculateProjection = (projectedStats, scoreSettings) => {
    let score = 0
    for(const stat in projectedStats) {
        const multiplier = scoreSettings[stat] ? scoreSettings[stat] : 0;
        score += projectedStats[stat] * multiplier;
    }
    return round(score);
}