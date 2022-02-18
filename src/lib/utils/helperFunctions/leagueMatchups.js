import {
	waitForAll,
	getLeagueUsers,
	getLeagueRosters,
	getNflState,
	leagueID,
	managers,
	getLeagueData } from '$lib/utils/helper';
import { get } from 'svelte/store';
import {matchupsStore} from '$lib/stores';

export const getLeagueMatchups = async () => {
	if(get(matchupsStore).matchupWeeks) return get(matchupsStore);

	const [nflState, leagueData, rosterRes, users, playoffsRes] = await waitForAll(
		getNflState(),
		getLeagueData(leagueID),
		getLeagueRosters(leagueID),
		getLeagueUsers(leagueID),
		fetch(`https://api.sleeper.app/v1/league/${leagueID}/winners_bracket`, {compress: true}),
	).catch((err) => { console.error(err); });
	const playoffs = await playoffsRes.json();

	let week = leagueData.status == 'complete' ? leagueData.settings.playoff_week_start - 1 + playoffs.pop().r : nflState.season_type == 'regular' ? nflState.display_week : nflState.season_type == 'post' ? 18 : 1;
	const year = leagueData.season;

	const regularSeasonLength = leagueData.settings.playoff_week_start - 1;
	const fullSeasonLength = regularSeasonLength + playoffs.pop().r;

	const rosters = rosterRes.rosters;

	const yearManagers = {};
    const yearP = parseInt(year);
    for(const manager of managers) {
		if(manager.yearsactive.includes(yearP)) {
			yearManagers[manager.roster] = {
				managerID: manager.managerID,
				rosterID: manager.roster,
				name: manager.name,
				status: manager.status,
				yearsactive: manager.yearsactive,
				abbreviation: manager.abbreviation,
			};
		}
	}

	// pull in all matchup data for the season
	const matchupsPromises = [];
	for(let i = 1; i < fullSeasonLength + 1; i++) {
		matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${leagueID}/matchups/${i}`, {compress: true}))
	}
	const matchupsRes = await waitForAll(...matchupsPromises);

	// convert the json matchup responses
	const matchupsJsonPromises = [];
	for(const matchupRes of matchupsRes) {
		const data = matchupRes.json();
		matchupsJsonPromises.push(data)
		if (!matchupRes.ok) throw new Error(data);
	}
	const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); }).catch((err) => { console.error(err); });

	const matchupWeeks = [];
	// process all the matchups
	for(let i = 1; i < matchupsData.length + 1; i++) {
		const processed = processMatchups(matchupsData[i - 1], yearManagers, rosters, users, i);
		if(processed) {
			matchupWeeks.push({
				matchups: processed.matchups,
				week: processed.week
			});
		}
	}

	const matchupsResponse = {
		matchupWeeks,
		year,
		week,
		regularSeasonLength,
		fullSeasonLength,
		rawData: matchupsData,
		managers: yearManagers,
	}
	
	matchupsStore.update(() => matchupsResponse);

	return matchupsResponse;
}

const processMatchups = (inputMatchups, yearManagers, rosters, users, week) => {
	if(!inputMatchups || inputMatchups.length == 0) return false; 
	
	const matchups = {};
	for(const match of inputMatchups) {
		if(!matchups[match.matchup_id]) matchups[match.matchup_id] = [];
		const user = users[rosters[match.roster_id - 1].owner_id];
		const recordManager = yearManagers[match.roster_id];
		const recordManID = recordManager.managerID;
		matchups[match.matchup_id].push({
			manager: {
				name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
				avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
				realname: recordManager.name,
				abbreviation: recordManager.abbreviation,
				rosterID: match.roster_id,
				recordManID,
			},
			recordManID,
			starters: match.starters,
			points: match.starters_points,
			matchID: match.matchup_id,
			rosterID: match.roster_id,
			totalFpts: match.points,
		})
	}
	return {matchups, week};
}
