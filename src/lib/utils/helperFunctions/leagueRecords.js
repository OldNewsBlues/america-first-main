import { getLeagueData } from './leagueData';
import { leagueID, managers, importHistory, importType } from '$lib/utils/leagueInfo';
import { getNflState } from './nflState';
import { getLeagueRosters } from "./leagueRosters"
import { getLeagueUsers } from "./leagueUsers"
import { waitForAll } from './multiPromise';
import { get } from 'svelte/store';
import {records} from '$lib/stores';
import { loadPlayers, getPreviousDrafts } from '$lib/utils/helper';
import { null_to_empty } from 'svelte/internal';
import leagueHistory from '$lib/utils/leagueHistory.json';

export const getLeagueRecords = async (refresh = false) => {
	if(get(records).seasonWeekRecords) {
		return get(records);
	}

	// if this isn't a refresh data call, check if there are already transactions stored in localStorage
	if(!refresh) {
		let localRecords = await JSON.parse(localStorage.getItem("records"));
		// check if transactions have been saved to localStorage before
		if(localRecords) {
			localRecords.stale = true;
			return localRecords;
		}
	}

	const playersData = await loadPlayers().catch((err) => { console.error(err); });
	const playersInfo = playersData.players;

	const previousDraftsData = await getPreviousDrafts().catch((err) => { console.error(err); });
	let draftInfo = {};

	for(const key in previousDraftsData) {
		const prevDraft = previousDraftsData[key];
		
		if(!draftInfo[prevDraft.year]) {
			draftInfo[prevDraft.year] = prevDraft;
		}
	}

	const nflState = await getNflState().catch((err) => { console.error(err); });
	let week = 0;
	let POrecordsWeek = 0;
	if(nflState.season_type == 'regular') {
		week = nflState.week - 1;
	} else if(nflState.season_type == 'post') {
		week = 18;
	}

	let curSeason = leagueID;

	let allManagers = {};
	
	let currentYear;
	let lastYear;

	let leagueRosterRecords = {}; 				// every full season stat point (for each year and all years combined)
	let playoffRosterRecords = {}; 
	let seasonWeekRecords = []; 				// highest weekly points within a single season
	let playoffWeekRecords = [];

	let masterRecordBook = {
		managers: {
			regularSeason: {
				alltime: {},
				years: {},
			},
			playoffs: {
				alltime: {},
				years: {},
			},
			combined: {
				alltime: {},
				years: {},
			},
			totals: {
				alltime: {},
				years: {},
			},
			grandTotals: {},
		},
		league: {
			regularSeason: {
				alltime: [],
				years: {},
			},
			playoffs: {
				alltime: [],
				years: {},
			},
			combined: {
				alltime: [],
				years: {},
			},
			totals: {
				alltime: {},
				years: {},
			},
			grandTotals: {
				regularSeason: [],
				playoffs: [],
				combined: [],
			},
		},
		players: {
			managers: {
				regularSeason: {
					alltime: {},
					years: {},
				},
				playoffs: {
					alltime: {},
					years: {},
				},
				combined: {
					alltime: {},
					years: {},
				},
				totals: {
					alltime: {},
					years: {},
					playerIDs: {},
				},
				grandTotals: {
					regularSeason: [],
					playoffs: [],
					combined: [],
				},
			},
			league: {
				regularSeason: {
					alltime: [],
					years: {},
				},
				playoffs: {
					alltime: [],
					years: {},
				},
				combined: {
					alltime: [],
					years: {},
				},
				totals: {
					alltime: {},
					years: {},
				},
				grandTotals: {
					regularSeason: [],
					playoffs: [],
					combined: [],
				},
			},
		},
	};

	let leagueManagers = {};
	let activeManagers = [];

	let playerRecords = {};
	let seasonPlayerRecords = {};

	let POplayerRecords = {};

	let headToHeadRecords = {
		regularSeason: {
			alltime: {},
			years: {},
		},
		playoffs: {
			alltime: {},
			years: {},
		},
		combined: {
			alltime: {},
			years: {},
		},
	}

	let playerPositionRecords = {
		league: {
			years: {},
			alltime: {
				regularSeason: {
					managerBests: {},
				},
				playoffs: {
					managerBests: {},
				},
				combined: {
					managerBests: {},
				},
			},
		},
		managers: {
			years: {},
			alltime: {
				regularSeason: {},
				playoffs: {},
				combined: {},
			},
		},
	};
	let recordArrays = {
		league: {
			years: {},
			alltime: {
				regularSeason: {
					managerBests: {},
					players: {},
				},
				playoffs: {
					managerBests: {},
					players: {},
				},
				combined: {
					managerBests: {},
					players: {},
				},
			},
		},
		managers: {
			years: {},
			alltime: {
				regularSeason: {},
				playoffs: {},
				combined: {},
			},
		},
	};
	let acquisitionRecords = {};

	const nflPositions = ["RB", "QB", "WR", "TE", "DEF", "K", "DL", "DE", "DT", "LB", "DB", "CB", "SS", "FS"];

	const numManagers = managers.length;
	const leagueRecordManagers = {};
	for(const managerID in managers) {
		const manager = managers[managerID];

		const entryMan = {
			managerID: manager.managerID,
			rosterID: manager.roster,
			name: manager.name,
			status: manager.status,
			yearsactive: manager.yearsactive,
		}

		if(!leagueManagers[manager.roster]) {
			leagueManagers[manager.roster] = [];
		}
		leagueManagers[manager.roster].push(entryMan);

		if(manager.status == "active") {
			activeManagers.push(manager.managerID);
		}

		leagueRecordManagers[manager.managerID] = entryMan;
	}
	const numActiveManagers = activeManagers.length;

	// SLEEPER RECORDS (MAIN)
	while(curSeason && curSeason != 0) {
		const [rosterRes, users, leagueData] = await waitForAll(
			getLeagueRosters(curSeason),
			getLeagueUsers(curSeason),
			getLeagueData(curSeason),
		).catch((err) => { console.error(err); });
	
		let year = parseInt(leagueData.season);
		const positions = leagueData.roster_positions.filter(p => p != 'BN');

		// variables for playoff records
		let numPOTeams = parseInt(leagueData.settings.playoff_teams);
		let playoffStart = parseInt(leagueData.settings.playoff_week_start);
		let playoffLength;
		let playoffType;
		let playoffCase;							// for later determining which playoff matchups we want to count (vs. discard)

		// before 2020, 1 week per PO round was only option
		if(year > 2019) {
			playoffType = parseInt(leagueData.settings.playoff_round_type);
		} else {
			playoffType = 0;
		}

		// calculate length of playoffs										"Relevant" Match IDs
		if(playoffType == 0) {							// 1W/r		4-team		6-team		8-team
			if(numPOTeams == 6) {						// last:	1, 2		1, 2		1, 2, 3, 4 						
				playoffLength = 3;						// 2-last:	1, 2		1, 2, 3		1, 2, 3, 4
				playoffCase = 1;						// 3-last:				1, 2		1, 2, 3, 4
			} else if(numPOTeams == 8) {
				playoffLength = 3;
				playoffCase = 2;
			} else if(numPOTeams == 4) {			
				playoffLength = 2;						
				playoffCase = 3;					
			}
		} else if(playoffType == 1 && year > 2020) {	// 1W/r+2c  4-team		6-team		8-team
			if(numPOTeams == 6) {						// last:	1			1			1
				playoffLength = 4;						// 2-last:	1, 2		1, 2		1, 2, 3, 4
				playoffCase = 4;						// 3-last:	1, 2		1, 2, 3		1, 2, 3, 4
			} else if(numPOTeams == 8) {				// 4-last:				1, 2		1, 2, 3, 4
				playoffLength = 4;
				playoffCase = 5
			} else if(numPOTeams == 4) {
				playoffLength = 3;
				playoffCase = 6;
			}
		} else if(playoffType == 2 ||
				  playoffType == 1 && year == 2020) {	// 2W/r  	4-team		6-team		8-team
			if(numPOTeams == 6) {						// last:	1, 2		1, 2		1, 2, 3, 4	
				playoffLength = 6;						// 2-last:	1, 2		1, 2		1, 2, 3, 4	
				playoffCase = 7;						// 3-last:	1, 2		1, 2, 3 	1, 2, 3, 4
			} else if (numPOTeams == 8) {				// 4-last: 	1, 2		1, 2, 3		1, 2, 3, 4
				playoffLength = 6;						// 5-last:				1, 2		1, 2, 3, 4
				playoffCase = 8;						// 6-last:				1, 2		1, 2, 3, 4
			} else if (numPOTeams == 4) {
				playoffLength = 4;
				playoffCase = 9;
			}
		}

		POrecordsWeek = playoffStart + playoffLength - 1;

		// on first run, week is provided above from nflState,
		// after that get the final week of regular season from leagueData
		if(leagueData.status == 'complete' || week > playoffStart - 1) {
			week = playoffStart - 1;
		}

		lastYear = year;
	
		const rosters = rosterRes.rosters;
		const numSeasonManagers = rosters.length;
		
		for(const roster of rosters) {
			const rosterID = roster.roster_id;		

			let recordManager = leagueManagers[rosterID].filter(m => m.yearsactive.includes(year));
			let recordManrosterID = recordManager[0].rosterID;
			let recordManID = recordManager[0].managerID;
			
			const draftResults = draftInfo[year].draft;
			for(const round in draftResults) {
				const draftPicks = draftResults[round];

				for(const pick in draftPicks) {
					const draftPick = draftPicks[pick].player;

					if(!acquisitionRecords[year]) {
						acquisitionRecords[year] = {};
					}

					if(draftPick.rosterID == recordManrosterID) {

						if(!acquisitionRecords[year][recordManID]) {
							acquisitionRecords[year][recordManID] = [];
						}
						acquisitionRecords[year][recordManID].push(draftPick);
					}
				}
			}
		}

		const originalManagers = {};
	
		for(const roster of rosters) {
			const rosterID = roster.roster_id;
			const user = users[roster.owner_id];
			
			let recordManager = leagueManagers[rosterID].filter(m => m.yearsactive.includes(year));
			let recordManID = recordManager[0].managerID;

			if(user) {
				originalManagers[recordManID] = {
					avatar: user.avatar != null ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` : `https://sleepercdn.com/images/v2/icons/player_default.webp`,
					name: user.metadata.team_name ? user.metadata.team_name : user.display_name,
					realname: recordManager[0].name,
				};
			} else {
				originalManagers[recordManID] = {
					avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
					name: 'Unknown Manager',
					realname: 'John Q. Rando',
				};
			}

			if(!allManagers[recordManID]) {
				allManagers[recordManID] = originalManagers[recordManID];
			}

			if(roster.settings.wins == 0 && roster.settings.ties == 0 && roster.settings.losses == 0) continue;

			if(!leagueRosterRecords[recordManID]) {
				leagueRosterRecords[recordManID] = {
					wins: 0,
					losses: 0,
					ties: 0,
					fptsFor: 0,
					fptsAgainst: 0,
					potentialPoints: 0,
					fptspg: 0,
					// regSeasonStreak: 0,
					manager: originalManagers[recordManID],
					years: [],
				}
			}
			// LONGEST STREAK UNDER CONSTRUCTION
			// const findMaximumRepeating = str => {
			// 	let max = 0;
			// 	let othermax = 0;
			// 	let maxtype = null;
			// 	let othermaxtype = null;
			// 	let streaks = {
			// 		maxarray: [],
			// 		typearray: [],
			// 	};
			// 	for(let start = 0, end = 1; end < str.length; ) {
			// 	   	if(str[end] === str[start]) {
			// 		  	if(max < end - start + 1) {
			// 				max = end - start + 1;
			// 				maxtype = str[end];
			// 		 	} else if((max === end - start + 1 || max > end - start + 1) && end - start + 1 > othermax) {
			// 				othermax = end - start + 1;
			// 			};
			// 		  	end++;
			// 	   	} else {
			// 			if(othermax === 0) {
			// 				othermax = 1;
			// 				othermaxtype = 
			// 			}
			// 			streaks.maxarray.push(max);
			// 			streaks.typearray.push(str[start]);
			// 		  	start = end;
			// 	   	};
			// 	};
			// 	return {
			// 		max,
			// 		maxtype,
			// 	}
			//  };

			// let regSeasonStreak = null;
			// const regSeasonRecord = roster.metadata.record;
			// if(typeof regSeasonRecord !== 'undefined') {
			// 	regSeasonStreak = findMaximumRepeating(regSeasonRecord);
			// }

			const fpts = roster.settings.fpts + (roster.settings.fpts_decimal / 100);
			const fptsAgainst = roster.settings.fpts_against + (roster.settings.fpts_against_decimal / 100);
			const potentialPoints = roster.settings.ppts + (roster.settings.ppts_decimal / 100);
			const fptspg = roster.settings.fpts / (roster.settings.wins + roster.settings.losses + roster.settings.ties);

			// add records to league roster record record
			leagueRosterRecords[recordManID].wins += roster.settings.wins;
			leagueRosterRecords[recordManID].losses += roster.settings.losses;
			leagueRosterRecords[recordManID].ties += roster.settings.ties;
			leagueRosterRecords[recordManID].fptsFor += fpts;
			leagueRosterRecords[recordManID].fptsAgainst += fptsAgainst;
			leagueRosterRecords[recordManID].potentialPoints += potentialPoints;

			// add singleSeason info [`${year}fptsFor`]
			const singleYearInfo = {
				wins: roster.settings.wins,
				losses: roster.settings.losses,
				ties: roster.settings.ties,
				fpts,
				fptsAgainst,
				potentialPoints,
				fptspg,
				// regSeasonStreak,
				manager: originalManagers[recordManID],
				year,
				recordManID,
			}

			leagueRosterRecords[recordManID].years.push(singleYearInfo);
			
			if(!playoffRosterRecords[recordManID]) {
				playoffRosterRecords[recordManID] = {
					wins: 0,
					losses: 0,
					ties: 0,
					fptsFor: 0,
					fptsAgainst: 0,
					potentialPoints: 0,
					fptspg: 0,
					POgames: 0,
					manager: originalManagers[recordManID],
					years: {},
					recordManID,
				}
			}

			playoffRosterRecords[recordManID].years[year] = {
				wins: 0,
				losses: 0,
				ties: 0,
				fpts: 0,
				fptsAgainst: 0,
				potentialPoints: 0,
				fptspg: 0,
				POgames: 0,
				manager: originalManagers[recordManID],
				year,
				recordManID,
			}
				
		}

		// loop through each week of the season
		const matchupsPromises = [];
		let startWeek = parseInt(week);

		const POmatchupsPromises = [];
		let POstartWeek = parseInt(POrecordsWeek);

		while(week > 0) {
			matchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${week}`, {compress: true}))
			week--;
		}
		while(POrecordsWeek > playoffStart - 1) {
			POmatchupsPromises.push(fetch(`https://api.sleeper.app/v1/league/${curSeason}/matchups/${POrecordsWeek}`, {compress: true}))
			POrecordsWeek--;
		}
	
		const matchupsRes = await waitForAll(...matchupsPromises).catch((err) => { console.error(err); });
		const POmatchupsRes = await waitForAll(...POmatchupsPromises).catch((err) => { console.error(err); });

		// convert the json matchup responses
			//regular season
		const matchupsJsonPromises = [];
		for(const matchupRes of matchupsRes) {
			const data = matchupRes.json();
			matchupsJsonPromises.push(data)
			if (!matchupRes.ok) {
				throw new Error(data);
			}
		}
		const matchupsData = await waitForAll(...matchupsJsonPromises).catch((err) => { console.error(err); });
			// playoffs
		const POmatchupsJsonPromises = [];
		for(const POmatchupRes of POmatchupsRes) {
			const POdata = POmatchupRes.json();
			POmatchupsJsonPromises.push(POdata)
			if (!POmatchupRes.ok) {
				throw new Error(POdata);
			}
		}
		const POmatchupsData = await waitForAll(...POmatchupsJsonPromises).catch((err) => { console.error(err); });

		// now that we've used the current season ID for everything we need, set it to the previous season
		curSeason = leagueData.previous_league_id;

		const playoffPointsRecord = [];

		// CREATING YEARLY RECORD OBJECTS/ARRAYS
		// League Objects/Arrays (for all-around records)
		masterRecordBook.league.playoffs.years[year] = [];
		masterRecordBook.league.regularSeason.years[year] = [];
		masterRecordBook.league.combined.years[year] = [];
		masterRecordBook.league.totals.years[year] = {};
		// Manager Objects/Arrays (for rankings)
		masterRecordBook.managers.playoffs.years[year] = [];
		masterRecordBook.managers.regularSeason.years[year] = [];
		masterRecordBook.managers.combined.years[year] = [];
		masterRecordBook.managers.totals.years[year] = [];
		// Player Objects/Arrays
		masterRecordBook.players.league.playoffs.years[year] = [];
		masterRecordBook.players.league.regularSeason.years[year] = [];
		masterRecordBook.players.league.combined.years[year] = [];
		masterRecordBook.players.league.totals.years[year] = {
			regularSeason: [],
			playoffs: [],
			combined: [],
		}
		masterRecordBook.players.managers.playoffs.years[year] = [];
		masterRecordBook.players.managers.regularSeason.years[year] = [];
		masterRecordBook.players.managers.combined.years[year] = [];
		masterRecordBook.players.managers.totals.years[year] = [];
		// Head to Head Objects
		headToHeadRecords.regularSeason.years[year] = {};
		headToHeadRecords.playoffs.years[year] = {};
		headToHeadRecords.combined.years[year] = {};
	
		if(startWeek > playoffStart - 1 || leagueData.status == 'complete') {
			// process all the PLAYOFFS matchups

			for(const POmatchupWeek of POmatchupsData) {
				let POmatchups = {};
				let POround = POstartWeek - POrecordsWeek;

				for(const POmatchup of POmatchupWeek) {
					let recordManager = leagueManagers[POmatchup.roster_id].filter(m => m.yearsactive.includes(year));
					let recordManID = recordManager[0].managerID;

					const POentry = {
						manager: originalManagers[recordManID],
						fpts: POmatchup.points,
						starters_points: POmatchup.starters_points,
						players_points: POmatchup.players_points,
						starters: POmatchup.starters,
						players: POmatchup.players,
						week: POstartWeek,
						year,
						rosterID: POmatchup.roster_id,
						recordManID,
					}

					// add each entry to the POmatchup object
					if(!POmatchups[POmatchup.matchup_id]) {
						POmatchups[POmatchup.matchup_id] = [];
					}
					POmatchups[POmatchup.matchup_id].push(POentry);
				}

				if(playoffCase == 4 && POstartWeek == POrecordsWeek + playoffLength ||     // Relevant Match IDs: 1
				   playoffCase == 5 && POstartWeek == POrecordsWeek + playoffLength ||
				   playoffCase == 6 && POstartWeek == POrecordsWeek + playoffLength) {

					const champMatch = POmatchups[1];

					let home = champMatch[0];
					let away = champMatch[1];
					if(champMatch[0].fpts < champMatch[1].fpts) {
						home = champMatch[1];
						away = champMatch[0];
					}
					const matchDifferential = home.fpts - away.fpts;

					for(const key in champMatch) {
						const opponent = champMatch[key];

						playoffRosterRecords[opponent.recordManID].years[year].fpts += opponent.fpts;
						playoffRosterRecords[opponent.recordManID].years[year].POgames++;

						const POweekEntry = {
							manager: opponent.manager,
							recordManID: opponent.recordManID,
							rosterID: opponent.rosterID,
							fpts: opponent.fpts,
							epePOWins: 0,
							epePOTies: 0,
							epePOLosses: 0,
							POweekWinner: new Boolean(false),
							POweekLoser: new Boolean(false),
							week: opponent.week,
							year,
						}

						const comboEntry = {
							manager: opponent.manager,
							recordManID: opponent.recordManID,
							rosterID: opponent.rosterID,
							fpts: opponent.fpts,
							fptspg: null,
							fptsAgainst: null,
							againstManager: null,
							againstRecordManID: null,
							epeWins: 0,
							epeTies: 0,
							epeLosses: 0,
							epePerc: 0,
							weekWinner: new Boolean(false),
							weekLoser: new Boolean(false),
							weekTie: new Boolean(false),
							medianPerc: null,
							topScore: new Boolean(false),
							bottomScore: new Boolean(false),
							matchWin: new Boolean(false),
							matchLoss: new Boolean(false),
							matchTie: new Boolean(false),
							matchDifferential,
							week: opponent.week,
							year,
						}

						if(opponent == home) {
							comboEntry.matchWin = true;
							comboEntry.fptsAgainst = away.fpts;
							comboEntry.againstManager = away.manager;
							comboEntry.againstRecordManID = away.recordManID;
						} else if(opponent == away) {
							comboEntry.matchLoss = true;
							comboEntry.matchDifferential = matchDifferential * (-1);
							comboEntry.fptsAgainst = home.fpts;
							comboEntry.againstManager = home.manager;
							comboEntry.againstRecordManID = home.recordManID;
						} else if(home.fpts == away.fpts) {
							comboEntry.matchTie = true;
							comboEntry.fptsAgainst = away.fpts;
							if(opponent.recordManID == home.recordManID) {
								comboEntry.againstManager = away.manager;
								comboEntry.againstRecordManID = away.recordManID;
							} else {
								comboEntry.againstManager = home.manager;
								comboEntry.againstRecordManID = home.recordManID;
							}
						}

						playoffPointsRecord.push(POweekEntry);

						masterRecordBook.league.playoffs.alltime.push(comboEntry);
						masterRecordBook.league.combined.alltime.push(comboEntry);
						if(!masterRecordBook.managers.playoffs.alltime[opponent.recordManID]) {
							masterRecordBook.managers.playoffs.alltime[opponent.recordManID] = [];
						}
						masterRecordBook.managers.playoffs.alltime[opponent.recordManID].push(comboEntry);
						if(!masterRecordBook.managers.combined.alltime[opponent.recordManID]) {
							masterRecordBook.managers.combined.alltime[opponent.recordManID] = [];
						}
						masterRecordBook.managers.combined.alltime[opponent.recordManID].push(comboEntry);

						masterRecordBook.league.playoffs.years[year].push(comboEntry);
						masterRecordBook.league.combined.years[year].push(comboEntry);
						if(!masterRecordBook.managers.playoffs.years[year][opponent.recordManID]) {
							masterRecordBook.managers.playoffs.years[year][opponent.recordManID] = [];
						}
						masterRecordBook.managers.playoffs.years[year][opponent.recordManID].push(comboEntry);
						if(!masterRecordBook.managers.combined.years[year][opponent.recordManID]) {
							masterRecordBook.managers.combined.years[year][opponent.recordManID] = [];
						}
						masterRecordBook.managers.combined.years[year][opponent.recordManID].push(comboEntry);

						const starters = opponent.starters;
						const startersPTS = opponent.starters_points.sort((a, b) => b - a);
						const numStarters = opponent.starters_points.length;
		
						const players = opponent.players;
						const playersPTS = opponent.players_points;
						
						for(let i = 0; i < players.length; i++) {
		
							const playerID = players[i];
		
							if(!POplayerRecords[year]) {
								POplayerRecords[year] = {};
							}
							if(!POplayerRecords[year][opponent.recordManID]) {
								POplayerRecords[year][opponent.recordManID] = {};
							}
		
							const playerPoints = playersPTS[playerID];
		
							let topStarter = new Boolean (false);
							let bottomStarter = new Boolean (false);
							let starterRank;
							let PTSasStarter;
							let PTSonBench;
							let benched = new Boolean (true);
							let rosterSpot;
		
							if(starters.includes(playerID)) {
								benched = false;
								PTSasStarter = playerPoints;
								PTSonBench = 0;
								starterRank = startersPTS.indexOf(playerPoints) + 1;
								if(startersPTS[0] == playerPoints) {
									topStarter = true;
								} else if(startersPTS[startersPTS.length - 1] == playerPoints) {
									bottomStarter = true;
								}
								rosterSpot = positions[starters.indexOf(playerID)];
							} else {
								benched = true;
								PTSonBench = playerPoints;
								PTSasStarter = 0;
								topStarter = false;
								bottomStarter = false;
								starterRank = null;
							}
							
							let playerInfo = playersInfo[playerID];
							let avatar = playerInfo.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;

							if(!POplayerRecords[year][opponent.recordManID][playerID]) {
								POplayerRecords[year][opponent.recordManID][playerID] = [];
							}
		
							const playerEntry = {		
								recordManID: opponent.recordManID,
								manager: originalManagers[opponent.recordManID],
								week: POstartWeek,
								year,
								rosterID: opponent.rosterID,
								playerID,
								playerPoints: PTSasStarter,
								benchPoints: PTSonBench,
								weeksStarted: null,
								weeksBenched: null,
								weeksOwned: null,
								benched,
								howAcquired: null,
								weekAcquired: null,
								topStarter,
								bottomStarter,
								starterRank,
								numStarters,
								starterRankAVG: null,
								playerInfo,
								avatar,
								rosterSpot,
							}

							// right now, acquisitions is just a list of the manager's draft picks
							let acquisitions = acquisitionRecords[year][opponent.recordManID];
							for(let i = 0; i < acquisitions.length; i++) {
								if(acquisitions[i].playerID == playerID) {
									playerEntry.howAcquired = 'draft';
									playerEntry.weekAcquired = 0;
								} 
							}
							POplayerRecords[year][opponent.recordManID][playerID].push(playerEntry);

							// add player arrays to ALLTIME

							masterRecordBook.players.league.playoffs.alltime.push(playerEntry);
							masterRecordBook.players.league.combined.alltime.push(playerEntry);
							if(!masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID]) {
								masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID].push(playerEntry);
							if(!masterRecordBook.players.managers.combined.alltime[opponent.recordManID]) {
								masterRecordBook.players.managers.combined.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.players.managers.combined.alltime[opponent.recordManID].push(playerEntry);

							// add player arrays to YEARS

							masterRecordBook.players.league.playoffs.years[year].push(playerEntry);
							masterRecordBook.players.league.combined.years[year].push(playerEntry);
							if(!masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID]) {
								masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID].push(playerEntry);
							if(!masterRecordBook.players.managers.combined.years[year][opponent.recordManID]) {
								masterRecordBook.players.managers.combined.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.players.managers.combined.years[year][opponent.recordManID].push(playerEntry);
						}
					}

					playoffRosterRecords[home.recordManID].years[year].fptsAgainst += away.fpts;
					playoffRosterRecords[away.recordManID].years[year].fptsAgainst += home.fpts;
				} else if(playoffCase == 3 ||														// Relevant Match IDs: 1, 2
				   		  playoffCase == 9 ||
				   		  playoffCase == 6 && POstartWeek < POrecordsWeek + playoffLength ||
				 		  playoffCase == 1 && POround != 2 ||
				 		  playoffCase == 4 && POround == 1 ||
				  		  playoffCase == 4 && POround == 3 ||
					      playoffCase == 7 && POround < 3 ||
				  		  playoffCase == 7 && POround > 4) {
					
					for(let i = 1; i < 3; i++) {

						let home = POmatchups[i][0];
						let away = POmatchups[i][1];
						if(POmatchups[i][0].fpts < POmatchups[i][1].fpts) {
							home = POmatchups[i][1];
							away = POmatchups[i][0];
						}
						const matchDifferential = home.fpts - away.fpts;

						for(const key in POmatchups[i]) {
							const opponent = POmatchups[i][key];

							playoffRosterRecords[opponent.recordManID].years[year].fpts += opponent.fpts;
							playoffRosterRecords[opponent.recordManID].years[year].POgames++;
	
							const POweekEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								epePOWins: 0,
								epePOTies: 0,
								epePOLosses: 0,
								POweekWinner: new Boolean(false),
								POweekLoser: new Boolean(false),
								week: opponent.week,
								year,
							}

							const comboEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								fptspg: null,
								fptsAgainst: null,
								againstManager: null,
								againstRecordManID: null,
								epeWins: 0,
								epeTies: 0,
								epeLosses: 0,
								epePerc: 0,
								weekWinner: new Boolean(false),
								weekLoser: new Boolean(false),
								weekTie: new Boolean(false),
								medianPerc: null,
								topScore: new Boolean(false),
								bottomScore: new Boolean(false),
								matchWin: new Boolean(false),
								matchLoss: new Boolean(false),
								matchTie: new Boolean(false),
								matchDifferential,
								week: opponent.week,
								year,
							}

							if(opponent == home) {
								comboEntry.matchWin = true;
								comboEntry.fptsAgainst = away.fpts;
								comboEntry.againstManager = away.manager;
								comboEntry.againstRecordManID = away.recordManID;
							} else if(opponent == away) {
								comboEntry.matchLoss = true;
								comboEntry.matchDifferential = matchDifferential * (-1);
								comboEntry.fptsAgainst = home.fpts;
								comboEntry.againstManager = home.manager;
								comboEntry.againstRecordManID = home.recordManID;
							} else if(home.fpts == away.fpts) {
								comboEntry.matchTie = true;
								comboEntry.fptsAgainst = away.fpts;
								if(opponent.recordManID == home.recordManID) {
									comboEntry.againstManager = away.manager;
									comboEntry.againstRecordManID = away.recordManID;
								} else {
									comboEntry.againstManager = home.manager;
									comboEntry.againstRecordManID = home.recordManID;
								}
							}
							
							playoffPointsRecord.push(POweekEntry);

							masterRecordBook.league.playoffs.alltime.push(comboEntry);
							masterRecordBook.league.combined.alltime.push(comboEntry);
							if(!masterRecordBook.managers.playoffs.alltime[opponent.recordManID]) {
								masterRecordBook.managers.playoffs.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.alltime[opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.alltime[opponent.recordManID]) {
								masterRecordBook.managers.combined.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.alltime[opponent.recordManID].push(comboEntry);
	
							masterRecordBook.league.playoffs.years[year].push(comboEntry);
							masterRecordBook.league.combined.years[year].push(comboEntry);
							if(!masterRecordBook.managers.playoffs.years[year][opponent.recordManID]) {
								masterRecordBook.managers.playoffs.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.years[year][opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.years[year][opponent.recordManID]) {
								masterRecordBook.managers.combined.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.years[year][opponent.recordManID].push(comboEntry);

							const starters = opponent.starters;
							const startersPTS = opponent.starters_points.sort((a, b) => b - a);
							const numStarters = opponent.starters_points.length;
			
							const players = opponent.players;
							const playersPTS = opponent.players_points;
							
							for(let i = 0; i < players.length; i++) {
			
								const playerID = players[i];
			
								if(!POplayerRecords[year]) {
									POplayerRecords[year] = {};
								}
								if(!POplayerRecords[year][opponent.recordManID]) {
									POplayerRecords[year][opponent.recordManID] = {};
								}
			
								const playerPoints = playersPTS[playerID];
			
								let topStarter = new Boolean (false);
								let bottomStarter = new Boolean (false);
								let starterRank;
								let PTSasStarter;
								let PTSonBench;
								let benched = new Boolean (true);
								let rosterSpot;
			
								if(starters.includes(playerID)) {
									benched = false;
									PTSasStarter = playerPoints;
									PTSonBench = 0;
									starterRank = startersPTS.indexOf(playerPoints) + 1;
									if(startersPTS[0] == playerPoints) {
										topStarter = true;
									} else if(startersPTS[startersPTS.length - 1] == playerPoints) {
										bottomStarter = true;
									}
									rosterSpot = positions[starters.indexOf(playerID)];
								} else {
									benched = true;
									PTSonBench = playerPoints;
									PTSasStarter = 0;
									topStarter = false;
									bottomStarter = false;
									starterRank = null;
								}
								
								let playerInfo = playersInfo[playerID];
								let avatar = playerInfo.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
	
								if(!POplayerRecords[year][opponent.recordManID][playerID]) {
									POplayerRecords[year][opponent.recordManID][playerID] = [];
								}
			
								const playerEntry = {		
									recordManID: opponent.recordManID,
									manager: originalManagers[opponent.recordManID],
									week: POstartWeek,
									year,
									rosterID: opponent.rosterID,
									playerID,
									playerPoints: PTSasStarter,
									benchPoints: PTSonBench,
									weeksStarted: null,
									weeksBenched: null,
									weeksOwned: null,
									benched,
									howAcquired: null,
									weekAcquired: null,
									topStarter,
									bottomStarter,
									starterRank,
									numStarters,
									starterRankAVG: null,
									playerInfo,
									avatar,
									rosterSpot,
								}
			
								// right now, acquisitions is just a list of the manager's draft picks
								let acquisitions = acquisitionRecords[year][opponent.recordManID];
								for(let i = 0; i < acquisitions.length; i++) {
									if(acquisitions[i].playerID == playerID) {
										playerEntry.howAcquired = 'draft';
										playerEntry.weekAcquired = 0;
									} 
								}
								POplayerRecords[year][opponent.recordManID][playerID].push(playerEntry);
	
								// add player arrays to ALLTIME

								masterRecordBook.players.league.playoffs.alltime.push(playerEntry);
								masterRecordBook.players.league.combined.alltime.push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID] = [];
								}	
								masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.combined.alltime[opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.alltime[opponent.recordManID].push(playerEntry);

								// add player arrays to YEARS

								masterRecordBook.players.league.playoffs.years[year].push(playerEntry);
								masterRecordBook.players.league.combined.years[year].push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.combined.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.years[year][opponent.recordManID].push(playerEntry);
							}
						}
	
						playoffRosterRecords[home.recordManID].years[year].fptsAgainst += away.fpts;
						playoffRosterRecords[away.recordManID].years[year].fptsAgainst += home.fpts;
					}
				} else if(playoffCase == 7 && 2 < POround < 5 ||									// Relevant Match IDs: 1, 2, 3
				   		  playoffCase == 4 && POround == 2 ||
				   		  playoffCase == 1 && POround == 2) {

					for(let i = 1; i < 4; i++) {
						
						let home = POmatchups[i][0];
						let away = POmatchups[i][1];
						if(POmatchups[i][0].fpts < POmatchups[i][1].fpts) {
							home = POmatchups[i][1];
							away = POmatchups[i][0];
						}
						const matchDifferential = home.fpts - away.fpts;
	
						for(const key in POmatchups[i]) {
							const opponent = POmatchups[i][key];

							playoffRosterRecords[opponent.recordManID].years[year].fpts += opponent.fpts;
							playoffRosterRecords[opponent.recordManID].years[year].POgames++;
	
							const POweekEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								epePOWins: 0,
								epePOTies: 0,
								epePOLosses: 0,
								POweekWinner: new Boolean(false),
								POweekLoser: new Boolean(false),
								week: opponent.week,
								year,
							}

							const comboEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								fptspg: null,
								fptsAgainst: null,
								againstManager: null,
								againstRecordManID: null,
								epeWins: 0,
								epeTies: 0,
								epeLosses: 0,
								epePerc: 0,
								weekWinner: new Boolean(false),
								weekLoser: new Boolean(false),
								weekTie: new Boolean(false),
								medianPerc: null,
								topScore: new Boolean(false),
								bottomScore: new Boolean(false),
								matchWin: new Boolean(false),
								matchLoss: new Boolean(false),
								matchTie: new Boolean(false),
								matchDifferential,
								week: opponent.week,
								year,
							}

							if(opponent == home) {
								comboEntry.matchWin = true;
								comboEntry.fptsAgainst = away.fpts;
								comboEntry.againstManager = away.manager;
								comboEntry.againstRecordManID = away.recordManID;
							} else if(opponent == away) {
								comboEntry.matchLoss = true;
								comboEntry.matchDifferential = matchDifferential * (-1);
								comboEntry.fptsAgainst = home.fpts;
								comboEntry.againstManager = home.manager;
								comboEntry.againstRecordManID = home.recordManID;
							} else if(home.fpts == away.fpts) {
								comboEntry.matchTie = true;
								comboEntry.fptsAgainst = away.fpts;
								if(opponent.recordManID == home.recordManID) {
									comboEntry.againstManager = away.manager;
									comboEntry.againstRecordManID = away.recordManID;
								} else {
									comboEntry.againstManager = home.manager;
									comboEntry.againstRecordManID = home.recordManID;
								}
							}

							playoffPointsRecord.push(POweekEntry);

							masterRecordBook.league.playoffs.alltime.push(comboEntry);
							masterRecordBook.league.combined.alltime.push(comboEntry);
							if(!masterRecordBook.managers.playoffs.alltime[opponent.recordManID]) {
								masterRecordBook.managers.playoffs.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.alltime[opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.alltime[opponent.recordManID]) {
								masterRecordBook.managers.combined.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.alltime[opponent.recordManID].push(comboEntry);
	
							masterRecordBook.league.playoffs.years[year].push(comboEntry);
							masterRecordBook.league.combined.years[year].push(comboEntry);
							if(!masterRecordBook.managers.playoffs.years[year][opponent.recordManID]) {
								masterRecordBook.managers.playoffs.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.years[year][opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.years[year][opponent.recordManID]) {
								masterRecordBook.managers.combined.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.years[year][opponent.recordManID].push(comboEntry);
							
							const starters = opponent.starters;
							const startersPTS = opponent.starters_points.sort((a, b) => b - a);
							const numStarters = opponent.starters_points.length;
			
							const players = opponent.players;
							const playersPTS = opponent.players_points;
							
							for(let i = 0; i < players.length; i++) {
			
								const playerID = players[i];
			
								if(!POplayerRecords[year]) {
									POplayerRecords[year] = {};
								}
								if(!POplayerRecords[year][opponent.recordManID]) {
									POplayerRecords[year][opponent.recordManID] = {};
								}
			
								const playerPoints = playersPTS[playerID];
			
								let topStarter = new Boolean (false);
								let bottomStarter = new Boolean (false);
								let starterRank;
								let PTSasStarter;
								let PTSonBench;
								let benched = new Boolean (true);
								let rosterSpot;
			
								if(starters.includes(playerID)) {
									benched = false;
									PTSasStarter = playerPoints;
									PTSonBench = 0;
									starterRank = startersPTS.indexOf(playerPoints) + 1;
									if(startersPTS[0] == playerPoints) {
										topStarter = true;
									} else if(startersPTS[startersPTS.length - 1] == playerPoints) {
										bottomStarter = true;
									}
									rosterSpot = positions[starters.indexOf(playerID)];
								} else {
									benched = true;
									PTSonBench = playerPoints;
									PTSasStarter = 0;
									topStarter = false;
									bottomStarter = false;
									starterRank = null;
								}
								
								let playerInfo = playersInfo[playerID];
								let avatar = playerInfo.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
	
								if(!POplayerRecords[year][opponent.recordManID][playerID]) {
									POplayerRecords[year][opponent.recordManID][playerID] = [];
								}
			
								const playerEntry = {		
									recordManID: opponent.recordManID,
									manager: originalManagers[opponent.recordManID],
									week: POstartWeek,
									year,
									rosterID: opponent.rosterID,
									playerID,
									playerPoints: PTSasStarter,
									benchPoints: PTSonBench,
									weeksStarted: null,
									weeksBenched: null,
									weeksOwned: null,
									benched,
									howAcquired: null,
									weekAcquired: null,
									topStarter,
									bottomStarter,
									starterRank,
									numStarters,
									starterRankAVG: null,
									playerInfo,
									avatar,
									rosterSpot,
								}
			
								// right now, acquisitions is just a list of the manager's draft picks
								let acquisitions = acquisitionRecords[year][opponent.recordManID];
								for(let i = 0; i < acquisitions.length; i++) {
									if(acquisitions[i].playerID == playerID) {
										playerEntry.howAcquired = 'draft';
										playerEntry.weekAcquired = 0;
									} 
								}
								POplayerRecords[year][opponent.recordManID][playerID].push(playerEntry);
	
								// add player arrays to ALLTIME

								masterRecordBook.players.league.playoffs.alltime.push(playerEntry);
								masterRecordBook.players.league.combined.alltime.push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.combined.alltime[opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.alltime[opponent.recordManID].push(playerEntry);

								// add player arrays to YEARS

								masterRecordBook.players.league.playoffs.years[year].push(playerEntry);
								masterRecordBook.players.league.combined.years[year].push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.combined.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.years[year][opponent.recordManID].push(playerEntry);
							}
						}
	
						playoffRosterRecords[home.recordManID].years[year].fptsAgainst += away.fpts;
						playoffRosterRecords[away.recordManID].years[year].fptsAgainst += home.fpts;
					}
				} else if(playoffCase == 8 ||														// Relevant Match IDs: 1, 2, 3, 4
				   		  playoffCase == 2 ||
				   		  playoffCase == 5 && POstartWeek < POrecordsWeek + playoffLength) {

					for(let i = 1; i < 5; i++) {
						
						let home = POmatchups[i][0];
						let away = POmatchups[i][1];
						if(POmatchups[i][0].fpts < POmatchups[i][1].fpts) {
							home = POmatchups[i][1];
							away = POmatchups[i][0];
						}
						const matchDifferential = home.fpts - away.fpts;
	
						for(const key in POmatchups[i]) {
							const opponent = POmatchups[i][key];

							playoffRosterRecords[opponent.recordManID].years[year].fpts += opponent.fpts;
							playoffRosterRecords[opponent.recordManID].years[year].POgames++;
	
							const POweekEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								epePOWins: 0,
								epePOTies: 0,
								epePOLosses: 0,
								POweekWinner: new Boolean(false),
								POweekLoser: new Boolean(false),
								week: opponent.week,
								year,
							}

							const comboEntry = {
								manager: opponent.manager,
								recordManID: opponent.recordManID,
								rosterID: opponent.rosterID,
								fpts: opponent.fpts,
								fptspg: null,
								fptsAgainst: null,
								againstManager: null,
								againstRecordManID: null,
								epeWins: 0,
								epeTies: 0,
								epeLosses: 0,
								epePerc: 0,
								weekWinner: new Boolean(false),
								weekLoser: new Boolean(false),
								weekTie: new Boolean(false),
								medianPerc: null,
								topScore: new Boolean(false),
								bottomScore: new Boolean(false),
								matchWin: new Boolean(false),
								matchLoss: new Boolean(false),
								matchTie: new Boolean (false),
								matchDifferential,
								week: opponent.week,
								year,
							}

							if(opponent == home) {
								comboEntry.matchWin = true;
								comboEntry.fptsAgainst = away.fpts;
								comboEntry.againstManager = away.manager;
								comboEntry.againstRecordManID = away.recordManID;
							} else if(opponent == away) {
								comboEntry.matchLoss = true;
								comboEntry.matchDifferential = matchDifferential * (-1);
								comboEntry.fptsAgainst = home.fpts;
								comboEntry.againstManager = home.manager;
								comboEntry.againstRecordManID = home.recordManID;
							} else if(home.fpts == away.fpts) {
								comboEntry.matchTie = true;
								comboEntry.fptsAgainst = away.fpts;
								if(opponent.recordManID == home.recordManID) {
									comboEntry.againstManager = away.manager;
									comboEntry.againstRecordManID = away.recordManID;
								} else {
									comboEntry.againstManager = home.manager;
									comboEntry.againstRecordManID = home.recordManID;
								}
							}

							playoffPointsRecord.push(POweekEntry);

							masterRecordBook.league.playoffs.alltime.push(comboEntry);
							masterRecordBook.league.combined.alltime.push(comboEntry);
							if(!masterRecordBook.managers.playoffs.alltime[opponent.recordManID]) {
								masterRecordBook.managers.playoffs.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.alltime[opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.alltime[opponent.recordManID]) {
								masterRecordBook.managers.combined.alltime[opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.alltime[opponent.recordManID].push(comboEntry);
	
							masterRecordBook.league.playoffs.years[year].push(comboEntry);
							masterRecordBook.league.combined.years[year].push(comboEntry);
							if(!masterRecordBook.managers.playoffs.years[year][opponent.recordManID]) {
								masterRecordBook.managers.playoffs.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.playoffs.years[year][opponent.recordManID].push(comboEntry);
							if(!masterRecordBook.managers.combined.years[year][opponent.recordManID]) {
								masterRecordBook.managers.combined.years[year][opponent.recordManID] = [];
							}
							masterRecordBook.managers.combined.years[year][opponent.recordManID].push(comboEntry);

							const starters = opponent.starters;
							const startersPTS = opponent.starters_points.sort((a, b) => b - a);
							const numStarters = opponent.starters_points.length;
			
							const players = opponent.players;
							const playersPTS = opponent.players_points;
							
							for(let i = 0; i < players.length; i++) {
			
								const playerID = players[i];
			
								if(!POplayerRecords[year]) {
									POplayerRecords[year] = {};
								}
								if(!POplayerRecords[year][opponent.recordManID]) {
									POplayerRecords[year][opponent.recordManID] = {};
								}
			
								const playerPoints = playersPTS[playerID];
			
								let topStarter = new Boolean (false);
								let bottomStarter = new Boolean (false);
								let starterRank;
								let PTSasStarter;
								let PTSonBench;
								let benched = new Boolean (true);
								let rosterSpot;
			
								if(starters.includes(playerID)) {
									benched = false;
									PTSasStarter = playerPoints;
									PTSonBench = 0;
									starterRank = startersPTS.indexOf(playerPoints) + 1;
									if(startersPTS[0] == playerPoints) {
										topStarter = true;
									} else if(startersPTS[startersPTS.length - 1] == playerPoints) {
										bottomStarter = true;
									}
									rosterSpot = positions[starters.indexOf(playerID)];
								} else {
									benched = true;
									PTSonBench = playerPoints;
									PTSasStarter = 0;
									topStarter = false;
									bottomStarter = false;
									starterRank = null;
								}
								
								let playerInfo = playersInfo[playerID];
								let avatar = playerInfo.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;
	
								if(!POplayerRecords[year][opponent.recordManID][playerID]) {
									POplayerRecords[year][opponent.recordManID][playerID] = [];
								}
			
								const playerEntry = {		
									recordManID: opponent.recordManID,
									manager: originalManagers[opponent.recordManID],
									week: POstartWeek,
									year,
									rosterID: opponent.rosterID,
									playerID,
									playerPoints: PTSasStarter,
									benchPoints: PTSonBench,
									weeksStarted: null,
									weeksBenched: null,
									weeksOwned: null,
									benched,
									howAcquired: null,
									weekAcquired: null,
									topStarter,
									bottomStarter,
									starterRank,
									numStarters,
									starterRankAVG: null,
									playerInfo,
									avatar,
									rosterSpot,
								}
			
								// right now, acquisitions is just a list of the manager's draft picks
								let acquisitions = acquisitionRecords[year][opponent.recordManID];
								for(let i = 0; i < acquisitions.length; i++) {
									if(acquisitions[i].playerID == playerID) {
										playerEntry.howAcquired = 'draft';
										playerEntry.weekAcquired = 0;
									} 
								}

								POplayerRecords[year][opponent.recordManID][playerID].push(playerEntry);
	
								// add player arrays to ALLTIME

								masterRecordBook.players.league.playoffs.alltime.push(playerEntry);
								masterRecordBook.players.league.combined.alltime.push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.playoffs.alltime[opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.alltime[opponent.recordManID]) {
									masterRecordBook.players.managers.combined.alltime[opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.alltime[opponent.recordManID].push(playerEntry);

								// add player arrays to YEARS

								masterRecordBook.players.league.playoffs.years[year].push(playerEntry);
								masterRecordBook.players.league.combined.years[year].push(playerEntry);
								if(!masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.playoffs.years[year][opponent.recordManID].push(playerEntry);
								if(!masterRecordBook.players.managers.combined.years[year][opponent.recordManID]) {
									masterRecordBook.players.managers.combined.years[year][opponent.recordManID] = [];
								}
								masterRecordBook.players.managers.combined.years[year][opponent.recordManID].push(playerEntry);
							}
						}
	
						playoffRosterRecords[home.recordManID].years[year].fptsAgainst += away.fpts;
						playoffRosterRecords[away.recordManID].years[year].fptsAgainst += home.fpts;
					}
				}

				POstartWeek--;

			}
						// calculate playoff records

			for(const recordManID in playoffRosterRecords) {
				const playoffRosterRecord = playoffRosterRecords[recordManID];

				if(playoffRosterRecord.years[year] && playoffRosterRecord.years[year].POgames > 0) {

					playoffRosterRecord.fptsFor += playoffRosterRecord.years[year].fpts;
					playoffRosterRecord.fptsAgainst += playoffRosterRecord.years[year].fptsAgainst;
					playoffRosterRecord.wins += playoffRosterRecord.years[year].wins;
					playoffRosterRecord.ties += playoffRosterRecord.years[year].ties;
					playoffRosterRecord.losses += playoffRosterRecord.years[year].losses;
					playoffRosterRecord.POgames += playoffRosterRecord.years[year].POgames;
					playoffRosterRecord.potentialPoints += playoffRosterRecord.years[year].potentialPoints;
				
					const fptspg = playoffRosterRecord.years[year].fpts / playoffRosterRecord.years[year].POgames;

				} else {
					continue;
				}
			}
			// per-season ranks & records to push thru seasonWeekRecords
			const interSeasonPOEntry = {
				year,
				playoffPointsRecords: playoffPointsRecord.sort((a, b) => b.fpts - a.fpts).slice(0, 10),
			}

			if(interSeasonPOEntry.playoffPointsRecords.length > 0) {
				if(!currentYear) {
					currentYear = year;
				}
				playoffWeekRecords.push(interSeasonPOEntry);
			};
		}
		
		// process all the REGULAR SEASON matchups
		for(const matchupWeek of matchupsData) {
			let matchups = {};

			for(const matchup of matchupWeek) {

				let recordManager = leagueManagers[matchup.roster_id].filter(m => m.yearsactive.includes(year));
				let recordManID = recordManager[0].managerID;

				const entry = {
					manager: originalManagers[recordManID],
					fpts: matchup.points,
					week: startWeek,
					year,
					rosterID: matchup.roster_id,
					epeWins: 0,
					epeTies: 0,
					epeLosses: 0,
					weekWinner: new Boolean(false),
					weekLoser: new Boolean(false),
					recordManID,
				}

				// add each entry to the matchup object
				if(!matchups[matchup.matchup_id]) {
					matchups[matchup.matchup_id] = [];
				}
				matchups[matchup.matchup_id].push(entry);

				const comboEntry = {
					manager: originalManagers[recordManID],
					recordManID,
					rosterID: matchup.roster_id,
					fpts: matchup.points,
					fptspg: null,
					fptsAgainst: null,
					againstManager: null,
					againstRecordManID: null,
					epeWins: 0,
					epeTies: 0,
					epeLosses: 0,
					epePerc: 0,
					weekWinner: new Boolean(false),
					weekLoser: new Boolean(false),
					weekTie: new Boolean(false),
					medianPerc: null,
					topScore: new Boolean(false),
					bottomScore: new Boolean(false),
					matchWin: new Boolean(false),
					matchLoss: new Boolean(false),
					matchTie: new Boolean(false),
					matchDifferential: 0,
					week: startWeek,
					year,
				}

				masterRecordBook.league.regularSeason.alltime.push(comboEntry);
				masterRecordBook.league.combined.alltime.push(comboEntry);				
				if(!masterRecordBook.managers.regularSeason.alltime[recordManID]) {
					masterRecordBook.managers.regularSeason.alltime[recordManID] = [];
				}
				masterRecordBook.managers.regularSeason.alltime[recordManID].push(comboEntry);
				if(!masterRecordBook.managers.combined.alltime[recordManID]) {
					masterRecordBook.managers.combined.alltime[recordManID] = [];
				}
				masterRecordBook.managers.combined.alltime[recordManID].push(comboEntry);

				masterRecordBook.league.regularSeason.years[year].push(comboEntry);
				masterRecordBook.league.combined.years[year].push(comboEntry);
				if(!masterRecordBook.managers.regularSeason.years[year][recordManID]) {
					masterRecordBook.managers.regularSeason.years[year][recordManID] = [];
				}
				masterRecordBook.managers.regularSeason.years[year][recordManID].push(comboEntry);
				if(!masterRecordBook.managers.combined.years[year][recordManID]) {
					masterRecordBook.managers.combined.years[year][recordManID] = [];
				}
				masterRecordBook.managers.combined.years[year][recordManID].push(comboEntry);

				const starters = matchup.starters;
				const startersPTS = matchup.starters_points.sort((a, b) => b - a);
				const numStarters = matchup.starters_points.length;

				const players = matchup.players;
				const playersPTS = matchup.players_points;
				
				for(let i = 0; i < players.length; i++) {

					const playerID = players[i];

					if(!playerRecords[year]) {
						playerRecords[year] = {};
					}
					if(!playerRecords[year][recordManID]) {
						playerRecords[year][recordManID] = {};
					}

					const playerPoints = playersPTS[playerID];

					let topStarter = new Boolean (false);
					let bottomStarter = new Boolean (false);
					let starterRank;
					let PTSasStarter;
					let PTSonBench;
					let benched = new Boolean (true);
					let rosterSpot;

					if(starters.includes(playerID)) {
						benched = false;
						PTSasStarter = playerPoints;
						PTSonBench = 0;
						starterRank = startersPTS.indexOf(playerPoints) + 1;
						if(startersPTS[0] == playerPoints) {
							topStarter = true;
						} else if(startersPTS[startersPTS.length - 1] == playerPoints) {
							bottomStarter = true;
						}
						rosterSpot = positions[starters.indexOf(playerID)];
					} else {
						benched = true;
						PTSonBench = playerPoints;
						PTSasStarter = 0;
						topStarter = false;
						bottomStarter = false;
						starterRank = null;
					}
					
					let playerInfo = playersInfo[playerID];
    				let avatar = playerInfo.pos == "DEF" ? `background-image: url(https://sleepercdn.com/images/team_logos/nfl/${playerID.toLowerCase()}.png)` : `background-image: url(https://sleepercdn.com/content/nfl/players/thumb/${playerID}.jpg), url(https://sleepercdn.com/images/v2/icons/player_default.webp)`;

					if(!playerRecords[year][recordManID][playerID]) {
						playerRecords[year][recordManID][playerID] = [];
					}

					const playerEntry = {		
						recordManID,
						manager: originalManagers[recordManID],
						week: startWeek,
						year,
						rosterID: matchup.roster_id,
						playerID,
						playerPoints: PTSasStarter,
						benchPoints: PTSonBench,
						weeksStarted: null,
						weeksBenched: null,
						weeksOwned: null,
						benched,
						howAcquired: null,
						weekAcquired: null,
						topStarter,
						bottomStarter,
						starterRank,
						numStarters,
						starterRankAVG: null,
						playerInfo,
						avatar,
						rosterSpot,
					}

					// right now, acquisitions is just a list of the manager's draft picks
					let acquisitions = acquisitionRecords[year][recordManID];
					for(let i = 0; i < acquisitions.length; i++) {
						if(acquisitions[i].playerID == playerID) {
							playerEntry.howAcquired = 'draft';
							playerEntry.weekAcquired = 0;
						} 
					}
					playerRecords[year][recordManID][playerID].push(playerEntry);

					// add player arrays to ALLTIME

					masterRecordBook.players.league.regularSeason.alltime.push(playerEntry);
					masterRecordBook.players.league.combined.alltime.push(playerEntry);
					if(!masterRecordBook.players.managers.regularSeason.alltime[recordManID]) {
						masterRecordBook.players.managers.regularSeason.alltime[recordManID] = [];
					}
					masterRecordBook.players.managers.regularSeason.alltime[recordManID].push(playerEntry);
					if(!masterRecordBook.players.managers.combined.alltime[recordManID]) {
						masterRecordBook.players.managers.combined.alltime[recordManID] = [];
					}
					masterRecordBook.players.managers.combined.alltime[recordManID].push(playerEntry);

					// add player arrays to YEARS

					masterRecordBook.players.league.regularSeason.years[year].push(playerEntry);
					masterRecordBook.players.league.combined.years[year].push(playerEntry);
					if(!masterRecordBook.players.managers.regularSeason.years[year][recordManID]) {
						masterRecordBook.players.managers.regularSeason.years[year][recordManID] = [];
					}
					masterRecordBook.players.managers.regularSeason.years[year][recordManID].push(playerEntry);
					if(!masterRecordBook.players.managers.combined.years[year][recordManID]) {
						masterRecordBook.players.managers.combined.years[year][recordManID] = [];
					}
					masterRecordBook.players.managers.combined.years[year][recordManID].push(playerEntry);

				}
				
			}
			startWeek--;
			
					      
			// create matchup differentials from matchups obj
			for(const matchupKey in matchups) {
				const matchup = matchups[matchupKey];
				let home = matchup[0];
				let away = matchup[1];
				if(matchup[0].fpts < matchup[1].fpts) {
					home = matchup[1];
					away = matchup[0];
				}

				// update recordbook entries
				if(home.fpts != away.fpts) {
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchWin = true;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchLoss = true;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchDifferential = home.fpts - away.fpts;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchDifferential = away.fpts - home.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchWin = true;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchLoss = true;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchDifferential = home.fpts - away.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchDifferential = away.fpts - home.fpts;

					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchWin = true;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchLoss = true;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchDifferential = home.fpts - away.fpts;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchDifferential = away.fpts - home.fpts;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchWin = true;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchLoss = true;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchDifferential = home.fpts - away.fpts;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchDifferential = away.fpts - home.fpts;
				} else if(home.fpts == away.fpts) {
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchTie = true;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchTie = true;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.league.regularSeason.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).matchTie = true;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).matchTie = true;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.league.combined.years[year].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.league.combined.years[year].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;

					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchTie = true;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchTie = true;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.managers.regularSeason.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.managers.regularSeason.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).matchTie = true;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).matchTie = true;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).fptsAgainst = away.fpts;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).fptsAgainst = home.fpts;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstManager = away.manager;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstManager = home.manager;
					masterRecordBook.managers.combined.years[year][home.recordManID].find(p => p.week == home.week && p.recordManID == home.recordManID).againstRecordManID = away.recordManID;
					masterRecordBook.managers.combined.years[year][away.recordManID].find(p => p.week == away.week && p.recordManID == away.recordManID).againstRecordManID = home.recordManID;
				}
			}
		}
		
		for(const recordType in masterRecordBook.managers) {
			const typeRecord = masterRecordBook.managers[recordType];

			if(recordType != "totals" && recordType != "grandTotals") {

				if(!masterRecordBook.league.totals.years[year][recordType]) {
					masterRecordBook.league.totals.years[year][recordType] = [];
				}
				if(!masterRecordBook.league.totals.alltime[recordType]) {
					masterRecordBook.league.totals.alltime[recordType] = [];
				}

				if(typeRecord.years[year].length > 0) {
					for(const recordManID in typeRecord.years[year]) {
						const recordMan = typeRecord.years[year][recordManID];

						if(!headToHeadRecords[recordType].alltime[recordManID]) {
							headToHeadRecords[recordType].alltime[recordManID] = {};
						}
						if(!headToHeadRecords[recordType].years[year][recordManID]) {
							headToHeadRecords[recordType].years[year][recordManID] = {};
						}

						let fptsTotal = 0;
						let fptsAgainstTotal = 0;
						let winTotal = 0;
						let lossTotal = 0;
						let tieTotal = 0;
						let runningDifferential = 0;
						let epeWinsTotal = 0;
						let epeTiesTotal = 0;
						let epeLossesTotal = 0;
						let weekWinners = 0;
						let weekLosers = 0;
						let weekTies = 0;
						let topScores = 0;
						let bottomScores = 0;
						// looping thru each week in that year
						for(let i = 0; i < recordMan.length; i++) {

							// add each week's win/loss to head-to-head records
							if(!headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID]) {
								headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID] = {
									wins: 0,
									ties: 0,
									losses: 0,
									fpts: 0,
									fptsAgainst: 0,
									againstRecordManID: recordMan[i].againstRecordManID,
									againstManager: recordMan[i].againstManager,
									showTies: false,
								}
							}
							if(!headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID]) {
								headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID] = {
									wins: 0,
									ties: 0,
									losses: 0,
									fpts: 0,
									fptsAgainst: 0,
									againstRecordManID: recordMan[i].againstRecordManID,
									againstManager: recordMan[i].againstManager,
									showTies: false,
								}
							}
							if(recordMan[i].matchWin == true) {
								headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID].wins++;
								headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].wins++;
							} else if(recordMan[i].matchTie == true) {
								headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID].ties++;
								headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].ties++;
								headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].showTies = true;
							} else if(recordMan[i].matchLoss == true) {
								headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID].losses++;
								headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].losses++;
							}
							headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID].fpts += recordMan[i].fpts;
							headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].fpts += recordMan[i].fpts;
							headToHeadRecords[recordType].years[year][recordManID][recordMan[i].againstRecordManID].fptsAgainst += recordMan[i].fptsAgainst;
							headToHeadRecords[recordType].alltime[recordManID][recordMan[i].againstRecordManID].fptsAgainst += recordMan[i].fptsAgainst;
							// add each week's score to running total
							fptsTotal += recordMan[i].fpts;
							fptsAgainstTotal += recordMan[i].fptsAgainst;
							runningDifferential += recordMan[i].matchDifferential;
							if(recordMan[i].matchWin == true) {
								winTotal++;
							} else if(recordMan[i].matchLoss == true) {
								lossTotal++;
							} else if(recordMan[i].matchTie == true) {
								tieTotal++;
							}
							// compare score to other scores from that week
							const compareWins = masterRecordBook.league[recordType].years[year].filter(p => p.week == recordMan[i].week && p.fpts < recordMan[i].fpts);
							const compareLosses = masterRecordBook.league[recordType].years[year].filter(p => p.week == recordMan[i].week && p.fpts > recordMan[i].fpts);
							const compareTies = masterRecordBook.league[recordType].years[year].filter(p => p.week == recordMan[i].week && p.fpts == recordMan[i].fpts && p.recordManID != recordMan[i].recordManID);
							// add EPE stats to running totals
							const epeWins = compareWins.length;
							const epeLosses = compareLosses.length;
							const epeTies = compareTies.length;
							epeWinsTotal += epeWins;
							epeLossesTotal += epeLosses;
							epeTiesTotal += epeTies;
							// update that week's EPE stats in league & manager(??) records
							const epePerc = (epeWins + epeTies / 2) / (epeWins + epeTies + epeLosses) * 100;
							masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).epeWins = epeWins;
							masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).epeLosses = epeLosses;
							masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).epeTies = epeTies;
							masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).epePerc = epePerc;
							// determine if top score of week AND update that week's entry in league & manager records
							if(epeLosses == 0) {			
								topScores++;
								masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).topScore = true;
							} else if(epeWins == 0) {
								bottomScores++;
								masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).bottomScore = true;
							}
							// determine if beat median score AND update that week's entry in league & manager(??) records
							let scoresArray = masterRecordBook.league[recordType].years[year].filter(p => p.week == recordMan[i].week);
							const numScores = scoresArray.length;
							scoresArray = scoresArray.sort((a, b) => b.fpts - a.fpts).slice(numScores / 2 - 1, numScores / 2 + 1);
							const medianScore = (scoresArray[0].fpts + scoresArray[1].fpts) / 2;
							if(recordMan[i].fpts > medianScore) {
								weekWinners++;
								masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).weekWinner = true;
							} else if(recordMan[i].fpts < medianScore) {
								weekLosers++;
								masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).weekLoser = true;
							} else if(recordMan[i].fpts == medianScore) {
								weekTies++;
								masterRecordBook.league[recordType].years[year].find(p => p.week == recordMan[i].week && p.recordManID == recordMan[i].recordManID).weekTie = true;
							}
						}

						const totalPPG = fptsTotal / recordMan.length; 
						const epePerc = (epeWinsTotal + epeTiesTotal / 2) / (epeWinsTotal + epeTiesTotal + epeLossesTotal) * 100;
						const medianPerc = (weekWinners + weekTies / 2) / (weekWinners + weekTies + weekLosers) * 100;
						const winPerc = (winTotal + tieTotal / 2) / (winTotal + tieTotal + lossTotal) * 100;
						const comboEntry = {
							manager: recordMan[0].manager,
							recordManID,
							rosterID: recordMan[0].rosterID,
							fpts: fptsTotal,
							fptspg: totalPPG,
							fptsAgainst: fptsAgainstTotal,
							epeWins: epeWinsTotal,
							epeTies: epeTiesTotal,
							epeLosses: epeLossesTotal,
							epePerc,
							weekWinners,
							weekLosers,
							weekTies,
							medianPerc,
							topScores,
							bottomScores,
							winPerc,
							wins: winTotal,
							losses: lossTotal,
							ties: tieTotal,
							periodDifferential: runningDifferential,
							week: null,
							year,
						}

						if(!masterRecordBook.managers.totals.years[year][recordManID]) {
							masterRecordBook.managers.totals.years[year][recordManID] = {
								regularSeason: [],
								playoffs: [],
								combined: [],
							}
						}
						if(!masterRecordBook.managers.totals.alltime[recordManID]) {
							masterRecordBook.managers.totals.alltime[recordManID] = {
								regularSeason: [],
								playoffs: [],
								combined: [],
							}
						}
						masterRecordBook.managers.totals.years[year][recordManID][recordType].push(comboEntry);
						masterRecordBook.league.totals.years[year][recordType].push(comboEntry);

						masterRecordBook.managers.totals.alltime[recordManID][recordType].push(comboEntry);
						masterRecordBook.league.totals.alltime[recordType].push(comboEntry);
					}
				} 
			}
		}

		for(const recordType in masterRecordBook.players.managers) {
			const typeRecord = masterRecordBook.players.managers[recordType];

			if(recordType != "totals" && recordType != "grandTotals") {

				if(!masterRecordBook.players.league.totals.alltime[recordType]) {
					masterRecordBook.players.league.totals.alltime[recordType] = [];
				}

				if(typeRecord.years[year].length > 0) {
					for(const recordManID in typeRecord.years[year]) {
						const recordMan = typeRecord.years[year][recordManID];
						
						let playerTotals = {};
						let uniqueStarters = 0;

						for(const key in recordMan) {
							const player = recordMan[key];

							if(!playerTotals[player.playerID]) {
								playerTotals[player.playerID] = {
									recordManID,
									manager: player.manager,
									week: null,
									year,
									rosterID: player.rosterID,
									playerID: player.playerID,
									playerPoints: 0,
									playerPPStart: 0,
									benchPoints: 0,
									weeksStarted: 0,
									weeksBenched: 0,
									weeksOwned: 0,
									benched: null,
									howAcquired: null,
									weekAcquired: null,
									topStarters: 0,
									bottomStarters: 0,
									starterRank: null,
									numStarters: null,
									starterRankAVG: null,
									starterRanks: 0,
									playerInfo: player.playerInfo,
									avatar: player.avatar,
									rosterSpot: player.rosterSpot,
								}
								if(player.benched == false) {
									uniqueStarters++;
								}
							}
							if(playerTotals[player.playerID].rosterSpot == null || playerTotals[player.playerID].rosterSpot.includes('FLEX')) {
								playerTotals[player.playerID].rosterSpot = player.rosterSpot;
							}
							playerTotals[player.playerID].weeksOwned++;
							if(player.benched == false) {
								playerTotals[player.playerID].playerPoints += player.playerPoints;
								playerTotals[player.playerID].weeksStarted++;
								playerTotals[player.playerID].starterRanks += player.starterRank;
								if(player.topStarter == true) {
									playerTotals[player.playerID].topStarters++;
								} else if(player.bottomStarter == true) {
									playerTotals[player.playerID].bottomStarters++;
								}
							} else if(player.benched == true) {
								playerTotals[player.playerID].benchPoints += player.playerPoints;
								playerTotals[player.playerID].weeksBenched++;
							}
						}

						for(const playerID in playerTotals) {
							const player = playerTotals[playerID];
						
							player.numStarters = uniqueStarters;
							if(player.weeksStarted > 0) {
								player.playerPPStart = player.playerPoints / player.weeksStarted;
								player.starterRankAVG = player.starterRanks / player.weeksStarted;
							} else {
								player.playerPPStart = 0;
								player.starterRankAVG = 0;
							}

							if(!masterRecordBook.players.managers.totals.playerIDs[playerID]) {
								masterRecordBook.players.managers.totals.playerIDs[playerID] = {
									regularSeason: [],
									playoffs: [],
									combined: [],
								}
							}
							masterRecordBook.players.managers.totals.playerIDs[playerID][recordType].push(player);
							if(!masterRecordBook.players.managers.totals.years[year][recordManID]) {
								masterRecordBook.players.managers.totals.years[year][recordManID] = {
									regularSeason: [],
									playoffs: [],
									combined: [],
								}
							}
							if(!masterRecordBook.players.managers.totals.alltime[recordManID]) {
								masterRecordBook.players.managers.totals.alltime[recordManID] = {
									regularSeason: [],
									playoffs: [],
									combined: [],
								}
							}
							masterRecordBook.players.managers.totals.years[year][recordManID][recordType].push(player);
							masterRecordBook.players.league.totals.years[year][recordType].push(player);

							masterRecordBook.players.managers.totals.alltime[recordManID][recordType].push(player);
							masterRecordBook.players.league.totals.alltime[recordType].push(player);
						}
					}
				}
			}
		}

		// PLAYER –– POSITION - playerPositionRecords is the book of finished ARRAYS representing various positional records/rankings
		playerPositionRecords.league.years[year] = {		// Directory: for every [year]
			regularSeason: {									// League: league-wide records (ie. pooled from all managers in that year)
				managerBests: {},									// regularSeason | playoffs | combined (RS & PO)
			},															// every position
			playoffs: {														// week_Top: top 10 highest-scoring performances at that position
				managerBests: {},											// period_Top: top 10 highest-scoring RS|PO|COM at that position
			},															// managerBests
			combined: {														// every position
				managerBests: {},												// week_Best: ranking every manager's highest-scoring performance at that position
			},																	// period_Best: ranking every manager's highest-scoring RS|PO|COM at that position
		};
		playerPositionRecords.managers.years[year] = {			// Managers: each manager's personal records (ie. pooled from all the players who scored for that manager in that year)
			regularSeason: {										// regularSeason | playoffs | combined (RS & PO)
				positionTotals: {},										// every position
			},																// week_Top: top 10 highest-scoring performances at that position
			playoffs: {														// period_Top: top 10 highest-scoring RS|PO|COM at that position
				positionTotals: {},										// positionTotals
			},																// every position
			combined: {															// week_Totals: ranking every week in the period by total points scored at that position
				positionTotals: {},												
			},
		};
		for(const recordPeriod in playerPositionRecords.league.years[year]) {
			for(const key in nflPositions) {
				const position = nflPositions[key];
				playerPositionRecords.league.years[year][recordPeriod][position] = {
					week_Top: masterRecordBook.players.league[recordPeriod].years[year].slice().filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
					period_Top: masterRecordBook.players.league.totals.years[year][recordPeriod].slice().filter(p => p.playerInfo.pos == position).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
				}
				for(const recordManID in masterRecordBook.managers.totals.years[year]) {
					if(!playerPositionRecords.managers.years[year][recordPeriod][recordManID]) {
						playerPositionRecords.managers.years[year][recordPeriod][recordManID] = {};
					}
					playerPositionRecords.managers.years[year][recordPeriod][recordManID][position] = {
						week_Top: masterRecordBook.players.league[recordPeriod].years[year].slice().filter(p => p.playerInfo.pos == position && p.benched == false && p.recordManID == recordManID).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
						period_Top: masterRecordBook.players.league.totals.years[year][recordPeriod].slice().filter(p => p.playerInfo.pos == position && p.recordManID == recordManID).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
					}
					if(!playerPositionRecords.league.years[year][recordPeriod].managerBests[position]) {
						playerPositionRecords.league.years[year][recordPeriod].managerBests[position] = {
							week_Best: [],
							period_Best: [],
						} 
					}
					playerPositionRecords.league.years[year][recordPeriod].managerBests[position].week_Best.push(playerPositionRecords.managers.years[year][recordPeriod][recordManID][position].week_Top.slice(0, 1)[0]);
					playerPositionRecords.league.years[year][recordPeriod].managerBests[position].period_Best.push(playerPositionRecords.managers.years[year][recordPeriod][recordManID][position].period_Top.slice(0, 1)[0]);
				}
				playerPositionRecords.league.years[year][recordPeriod].managerBests[position].week_Best = playerPositionRecords.league.years[year][recordPeriod].managerBests[position].week_Best.sort((a, b) => b.playerPoints - a.playerPoints);
				playerPositionRecords.league.years[year][recordPeriod].managerBests[position].period_Best = playerPositionRecords.league.years[year][recordPeriod].managerBests[position].period_Best.sort((a, b) => b.playerPoints - a.playerPoints);
			}
		}
		recordArrays.league.years[year] = {
			regularSeason: {
				managerBests: {},
				players: {},
			},
			playoffs: {
				managerBests: {},
				players: {},
			},
			combined: {
				managerBests: {},
				players: {},
			},
		};
		recordArrays.managers.years[year] = {
			regularSeason: {
				managerBests: {},
				players: {},
			},
			playoffs: {
				managerBests: {},
				players: {},
			},
			combined: {
				managerBests: {},
				players: {},
			},
		};
		for(const recordPeriod in masterRecordBook.league.totals.years[year]) {
			recordArrays.league.years[year][recordPeriod] = {
				week_Top: masterRecordBook.league[recordPeriod].years[year].slice().sort((a, b) => b.fpts - a.fpts).slice(0, 10),
				week_Low: masterRecordBook.league[recordPeriod].years[year].slice().sort((a, b) => a.fpts - b.fpts).slice(0, 10),
				period_Top: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg).slice(0, 10),
				period_Low: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => a.fptspg - b.fptspg).slice(0, 10),
				biggestBlowouts: masterRecordBook.league[recordPeriod].years[year].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
				narrowestVictories: masterRecordBook.league[recordPeriod].years[year].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
			};
			recordArrays.league.years[year][recordPeriod].managerBests = {
				week_Best: [],
				week_Worst: [],
				period_Best: [],
				period_Worst: [],
				blowout_Best: [],
				blowout_Worst: [],
				narrow_Best: [],
				narrow_Worst: [],
				epeRecords: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.epePerc - a.epePerc),
				medianRecords: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.medianPerc - a.medianPerc),
				cumulativePoints: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg),
				winRecords: masterRecordBook.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.winPerc - a.winPerc),
			};
			recordArrays.league.years[year][recordPeriod].players = {
				week_Best: [],
				week_MissedBest: [],
				week_Top: masterRecordBook.players.league[recordPeriod].years[year].slice().filter(p => p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
				week_MissedTop: masterRecordBook.players.league[recordPeriod].years[year].slice().filter(p => p.benched == true).sort((a, b) => b.benchPoints - a.benchPoints).slice(0, 10),
				period_Best: [],
				period_Top: masterRecordBook.players.league.totals.years[year][recordPeriod].slice().sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),	
			};
			for(const recordManID in masterRecordBook.players.managers[recordPeriod].years[year]) {
				recordArrays.league.years[year][recordPeriod].players.week_Best.push(masterRecordBook.players.managers[recordPeriod].years[year][recordManID].slice().filter(p => p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].players.week_MissedBest.push(masterRecordBook.players.managers[recordPeriod].years[year][recordManID].slice().filter(p => p.benched == true).sort((a, b) => b.benchPoints - a.benchPoints).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].players.period_Best.push(masterRecordBook.players.managers.totals.years[year][recordManID][recordPeriod].slice().sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].managerBests.week_Best.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().sort((a, b) => b.fpts - a.fpts).slice(0, 1)[0]); 
				recordArrays.league.years[year][recordPeriod].managerBests.week_Worst.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().sort((a, b) => a.fpts - b.fpts).slice(0, 1)[0]); 
				recordArrays.league.years[year][recordPeriod].managerBests.period_Best.push(masterRecordBook.managers.totals.years[year][recordManID][recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg).slice(0, 1)[0]); 
				recordArrays.league.years[year][recordPeriod].managerBests.period_Worst.push(masterRecordBook.managers.totals.years[year][recordManID][recordPeriod].slice().sort((a, b) => a.fptspg - b.fptspg).slice(0, 1)[0]); 
				recordArrays.league.years[year][recordPeriod].managerBests.blowout_Best.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].managerBests.blowout_Worst.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].managerBests.narrow_Best.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 1)[0]);
				recordArrays.league.years[year][recordPeriod].managerBests.narrow_Worst.push(masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 1)[0]);
				if(!recordArrays.managers.years[year][recordPeriod][recordManID]) {		
					recordArrays.managers.years[year][recordPeriod][recordManID] = {
						week_Best: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().sort((a, b) => b.fpts - a.fpts).slice(0, 10),
						week_Worst: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().sort((a, b) => a.fpts - b.fpts).slice(0, 10),
						blowout_Best: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
						blowout_Worst: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
						narrow_Best: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
						narrow_Worst: masterRecordBook.managers[recordPeriod].years[year][recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
					};
				}
			}
			recordArrays.league.years[year][recordPeriod].players.week_Best = recordArrays.league.years[year][recordPeriod].players.week_Best.sort((a, b) => b.playerPoints - a.playerPoints);
			recordArrays.league.years[year][recordPeriod].players.week_MissedBest = recordArrays.league.years[year][recordPeriod].players.week_MissedBest.sort((a, b) => b.benchPoints - a.benchPoints);
			recordArrays.league.years[year][recordPeriod].players.period_Best = recordArrays.league.years[year][recordPeriod].players.period_Best.sort((a, b) => b.playerPoints - a.playerPoints);
			recordArrays.league.years[year][recordPeriod].managerBests.week_Best = recordArrays.league.years[year][recordPeriod].managerBests.week_Best.sort((a, b) => b.fpts - a.fpts);	
			recordArrays.league.years[year][recordPeriod].managerBests.week_Worst = recordArrays.league.years[year][recordPeriod].managerBests.week_Worst.sort((a, b) => b.fpts - a.fpts);		
			recordArrays.league.years[year][recordPeriod].managerBests.period_Best = recordArrays.league.years[year][recordPeriod].managerBests.period_Best.sort((a, b) => b.fptspg - a.fptspg);
			recordArrays.league.years[year][recordPeriod].managerBests.period_Worst = recordArrays.league.years[year][recordPeriod].managerBests.period_Worst.sort((a, b) => b.fptspg - a.fptspg);
			recordArrays.league.years[year][recordPeriod].managerBests.blowout_Best = recordArrays.league.years[year][recordPeriod].managerBests.blowout_Best.sort((a, b) => b.matchDifferential - a.matchDifferential);
			recordArrays.league.years[year][recordPeriod].managerBests.blowout_Worst = recordArrays.league.years[year][recordPeriod].managerBests.blowout_Worst.sort((a, b) => a.matchDifferential - b.matchDifferential);
			recordArrays.league.years[year][recordPeriod].managerBests.narrow_Best = recordArrays.league.years[year][recordPeriod].managerBests.narrow_Best.sort((a, b) => a.matchDifferential - b.matchDifferential);
			recordArrays.league.years[year][recordPeriod].managerBests.narrow_Worst = recordArrays.league.years[year][recordPeriod].managerBests.narrow_Worst.sort((a, b) => b.matchDifferential - a.matchDifferential);
		}

		// per-season ranks & records to push thru seasonWeekRecords
		const interSeasonEntry = {
			year,
			seasonPointsRecords: recordArrays.league.years[year].regularSeason.week_Top,
			leagueRecordArrays: recordArrays.league.years[year],
		}

		if(interSeasonEntry.seasonPointsRecords.length > 0) {
			if(!currentYear) {
				currentYear = year;
			}
			seasonWeekRecords.push(interSeasonEntry);
		};
		
	} // SEASON LOOPS HERE


	// IMPORT HISTORY
	// if(importHistory == true) {
	// 	const historyData = leagueHistory;
	// 	const weekScores = {};
	// 	const importRecords = {};

	// 	for(const key in historyData.managers) {
	// 		const recordManID = historyData.managers[key].recordManID;
	// 		importRecords[recordManID] = {
	// 			years: {},
	// 			fpts: 0,
	// 			fptsAgainst: 0,
	// 			fptspg: 0,
	// 			wins: 0,
	// 			losses: 0,
	// 			ties: 0,
	// 			winPerc: null,
	// 			epeWins: 0,
	// 			epeLosses: 0,
	// 			epeTies: 0,
	// 			epePerc: null,
	// 			topScores: 0,
	// 			bottomScores: 0,
	// 			weekWins: 0,
	// 			weekLosses: 0,
	// 			weekTies: 0,
	// 			medianPerc: null,
	// 		};

	// 		if(!allManagers[recordManID]) {
	// 			allManagers[recordManID] = {
	// 				avatar: `https://sleepercdn.com/images/v2/icons/player_default.webp`,
	// 				name: 'Placeholder',
	// 				realname: leagueRecordManagers[recordManID].name,
	// 			};
	// 		}

	// 		for(const year in historyData.managers[key].years) {
	// 			const yearTotals = historyData.managers[key].years[year]

	// 			importRecords[recordManID].fpts += yearTotals.totalFpts;
	// 			importRecords[recordManID].fptsAgainst += yearTotals.totalFptsAgainst;
	// 			importRecords[recordManID].wins += yearTotals.wins;
	// 			importRecords[recordManID].losses += yearTotals.losses;
	// 			importRecords[recordManID].ties += yearTotals.ties;

	// 			const totalPPG = yearTotals.totalFpts / (yearTotals.wins + yearTotals.losses + yearTotals.ties); 
	// 			const winPerc = (yearTotals.wins + yearTotals.ties / 2) / (yearTotals.wins + yearTotals.losses + yearTotals.ties) * 100;
	// 			const simpleEntry = {
	// 				manager: allManagers[recordManID],
	// 				recordManID: recordManID,
	// 				rosterID: leagueRecordManagers[recordManID].rosterID,
	// 				fpts: yearTotals.totalFpts,
	// 				fptspg: totalPPG,
	// 				fptsAgainst: yearTotals.totalFptsAgainst,
	// 				epeWins: 0,
	// 				epeTies: 0,
	// 				epeLosses: 0,
	// 				epePerc: null,
	// 				weekWins: 0,
	// 				weekLosses: 0,
	// 				weekTies: 0,
	// 				medianPerc: null,
	// 				topScores: 0,
	// 				bottomScores: 0,
	// 				winPerc: winPerc,
	// 				wins: yearTotals.wins,
	// 				losses: yearTotals.losses,
	// 				ties: yearTotals.ties,
	// 				periodDifferential: null,
	// 				weeks: {},
	// 				year: yearTotals.year
	// 			}

	// 			if(importType == 'complex' || importType == 'super') {
	// 				if(!weekScores[yearTotals.year]) {
	// 					weekScores[yearTotals.year] = {};
	// 				}

	// 				for(const week in yearTotals.weeks) {
	// 					const weekTotals = yearTotals.weeks[week];
	
	// 					if(!weekScores[yearTotals.year][weekTotals.week]) {
	// 						weekScores[yearTotals.year][weekTotals.week] = [];
	// 					}
	// 					weekScores[yearTotals.year][weekTotals.week].push(weekTotals.fpts)
	// 					simpleEntry.weeks[weekTotals.week] = weekTotals;
	// 				}
	// 			} 
	// 			if(importType == 'super') {
					
	// 			}

	// 			importRecords[recordManID].years[yearTotals.year] = simpleEntry;
	// 		}
	// 		importRecords[recordManID].winPerc = (importRecords[recordManID].wins + importRecords[recordManID].ties / 2) / (importRecords[recordManID].wins + importRecords[recordManID].ties + importRecords[recordManID].losses) * 100;
	// 		importRecords[recordManID].fptspg = importRecords[recordManID].fpts / (importRecords[recordManID].wins + importRecords[recordManID].ties + importRecords[recordManID].losses);
	// 	}

	// 	if(importType == 'complex' || importType == 'super') {

	// 		for(const recordManID in importRecords) {

	// 			for(const year in importRecords[recordManID].years) {

	// 				for(const week in weekScores[year]) {

	// 					const compareScore = importRecords[recordManID].years[year].weeks[week].fpts;
	// 					const epeWins = weekScores[year][week].filter(s => s < compareScore).length;
	// 					const epeLosses = weekScores[year][week].filter(s => s > compareScore).length;
	// 					const epeTies = weekScores[year][week].filter(s => s == compareScore).length - 1;

	// 					importRecords[recordManID].years[year].epeWins += epeWins;
	// 					importRecords[recordManID].years[year].epeLosses += epeLosses;
	// 					importRecords[recordManID].years[year].epeTies += epeTies;
	// 					importRecords[recordManID].epeWins += epeWins;
	// 					importRecords[recordManID].epeLosses += epeLosses;
	// 					importRecords[recordManID].epeTies += epeTies;

	// 					if(epeWins == 0) {
	// 						importRecords[recordManID].years[year].bottomScores++;
	// 						importRecords[recordManID].bottomScores++;
	// 					} else if(epeLosses == 0) {
	// 						importRecords[recordManID].years[year].topScores++;
	// 						importRecords[recordManID].topScores++;
	// 					}

	// 					const middleScores = weekScores[year][week].sort((a, b) => b - a).slice(weekScores[year][week].length / 2 - 1, weekScores[year][week].length / 2 + 1);
	// 					const medianScore = (middleScores[0] + middleScores[1]) / 2;
	// 					if(compareScore > medianScore) {
	// 						importRecords[recordManID].years[year].weekWins++;
	// 						importRecords[recordManID].weekWins++;
	// 					} else if(compareScore < medianScore) {
	// 						importRecords[recordManID].years[year].weekLosses++;
	// 						importRecords[recordManID].weekLosses++; 
	// 					} else if(compareScore == medianScore) {
	// 						importRecords[recordManID].years[year].weekTies++;
	// 						importRecords[recordManID].weekTies++;
	// 					}
	// 				}
	// 				importRecords[recordManID].years[year].epePerc = (importRecords[recordManID].years[year].epeWins + importRecords[recordManID].years[year].epeTies / 2) / (importRecords[recordManID].years[year].epeWins + importRecords[recordManID].years[year].epeTies + importRecords[recordManID].years[year].epeLosses) * 100;
	// 				importRecords[recordManID].years[year].medianPerc = (importRecords[recordManID].years[year].weekWins + importRecords[recordManID].years[year].weekTies / 2) / (importRecords[recordManID].years[year].weekWins + importRecords[recordManID].years[year].weekTies + importRecords[recordManID].years[year].weekLosses) * 100;
	// 			}
	// 			importRecords[recordManID].epePerc = (importRecords[recordManID].epeWins + importRecords[recordManID].epeTies / 2) / (importRecords[recordManID].epeWins + importRecords[recordManID].epeTies + importRecords[recordManID].epeLosses) * 100;
	// 			importRecords[recordManID].medianPerc = (importRecords[recordManID].weekWins + importRecords[recordManID].weekTies / 2) / (importRecords[recordManID].weekWins + importRecords[recordManID].weekTies + importRecords[recordManID].weekLosses) * 100;
	// 		}

	// 	} else if(importType == 'super') {

	// 	}


	// }


	
	// calculate all-time records involving multi-season cumulative stats
	for(const recordManID in masterRecordBook.managers.totals.alltime) {
		const recordMan = masterRecordBook.managers.totals.alltime[recordManID];

		if(!masterRecordBook.managers.grandTotals[recordManID]) {
			masterRecordBook.managers.grandTotals[recordManID] = {
				regularSeason: [],
				playoffs: [],
				combined: [],
			}
		}

		for(const recordType in recordMan) {
			const typeRecord = recordMan[recordType];

			if(typeRecord.length > 0 && recordType != "totals" && recordType != "grandTotals") {
				
				let fptsTotal = 0;
				let winTotal = 0;
				let tieTotal = 0;
				let lossTotal = 0;
				let fptsAgainstTotal = 0;
				let epeWinsTotal = 0;
				let epeTiesTotal = 0;
				let epeLossesTotal = 0;
				let weekWinners = 0;
				let weekLosers = 0;
				let weekTies = 0;
				let topScores = 0;
				let bottomScores = 0;
				// looping thru totals from each regSeason, playoff, & combined regSeason+playoff
				for(let i = 0; i < typeRecord.length; i++) {
					fptsTotal += typeRecord[i].fpts;
					fptsAgainstTotal += typeRecord[i].fptsAgainst;
					winTotal += typeRecord[i].wins;
					tieTotal += typeRecord[i].ties;
					lossTotal += typeRecord[i].losses;
					epeWinsTotal += typeRecord[i].epeWins;
					epeTiesTotal += typeRecord[i].epeTies;
					epeLossesTotal += typeRecord[i].epeLosses;
					weekWinners += typeRecord[i].weekWinners;
					weekLosers += typeRecord[i].weekLosers;
					weekTies += typeRecord[i].weekTies;
					topScores += typeRecord[i].topScores;
					bottomScores += typeRecord[i].bottomScores;
				}
				// determine all-time PPG, epe W%, median W% for ALL regSeason, PO, & combined
				const totalPPG = fptsTotal / (weekWinners + weekTies + weekLosers);  		// denominator is equal to # of games played for this record type
				const epePerc = (epeWinsTotal + epeTiesTotal / 2) / (epeWinsTotal + epeTiesTotal + epeLossesTotal) * 100;
				const medianPerc = (weekWinners + weekTies / 2) / (weekWinners + weekTies + weekLosers) * 100;
				const winPerc = (winTotal + tieTotal / 2) / (winTotal + tieTotal + lossTotal) * 100;

				const comboEntry = {
					manager: typeRecord[0].manager,
					recordManID,
					rosterID: typeRecord[0].rosterID,
					fpts: fptsTotal,
					fptspg: totalPPG,
					fptsAgainst: fptsAgainstTotal,
					epeWins: epeWinsTotal,
					epeTies: epeTiesTotal,
					epeLosses: epeLossesTotal,
					epePerc,
					weekWinners,
					weekLosers,
					weekTies,
					wins: winTotal,
					ties: tieTotal,
					losses: lossTotal,
					winPerc,
					medianPerc,
					topScores,
					bottomScores,
					week: null,
					year: null,
				}

				masterRecordBook.managers.grandTotals[recordManID][recordType].push(comboEntry);
				masterRecordBook.league.grandTotals[recordType].push(comboEntry);
			}
		}
	}

	// PLAYER –– POSITION –– ALLTIME - playerPositionRecords is the book of finished ARRAYS representing various positional records/rankings
	for(const recordPeriod in playerPositionRecords.league.alltime) {
		for(const key in nflPositions) {
			const position = nflPositions[key];
			playerPositionRecords.league.alltime[recordPeriod][position] = {
				week_Top: masterRecordBook.players.league[recordPeriod].alltime.slice().filter(p => p.playerInfo.pos == position && p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
				period_Top: masterRecordBook.players.league.totals.alltime[recordPeriod].slice().filter(p => p.playerInfo.pos == position).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
			}
			for(const recordManID in masterRecordBook.managers.totals.alltime) {
				if(!playerPositionRecords.managers.alltime[recordPeriod][recordManID]) {
					playerPositionRecords.managers.alltime[recordPeriod][recordManID] = {};
				}
				playerPositionRecords.managers.alltime[recordPeriod][recordManID][position] = {
					week_Top: masterRecordBook.players.league[recordPeriod].alltime.slice().filter(p => p.playerInfo.pos == position && p.benched == false && p.recordManID == recordManID).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
					period_Top: masterRecordBook.players.league.totals.alltime[recordPeriod].slice().filter(p => p.playerInfo.pos == position && p.recordManID == recordManID).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
				}
				if(!playerPositionRecords.league.alltime[recordPeriod].managerBests[position]) {
					playerPositionRecords.league.alltime[recordPeriod].managerBests[position] = {
						week_Best: [],
						period_Best: [],
					} 
				}
				playerPositionRecords.league.alltime[recordPeriod].managerBests[position].week_Best.push(playerPositionRecords.managers.alltime[recordPeriod][recordManID][position].week_Top.slice(0, 1)[0]);
				playerPositionRecords.league.alltime[recordPeriod].managerBests[position].period_Best.push(playerPositionRecords.managers.alltime[recordPeriod][recordManID][position].period_Top.slice(0, 1)[0]);
			}
			playerPositionRecords.league.alltime[recordPeriod].managerBests[position].week_Best = playerPositionRecords.league.alltime[recordPeriod].managerBests[position].week_Best.sort((a, b) => b.playerPoints - a.playerPoints);
			playerPositionRecords.league.alltime[recordPeriod].managerBests[position].period_Best = playerPositionRecords.league.alltime[recordPeriod].managerBests[position].period_Best.sort((a, b) => b.playerPoints - a.playerPoints);
		}
	}

	for(const recordPeriod in masterRecordBook.league.totals.alltime) {
		recordArrays.league.alltime[recordPeriod] = {
			week_Top: masterRecordBook.league[recordPeriod].alltime.slice().sort((a, b) => b.fpts - a.fpts).slice(0, 10),
			week_Low: masterRecordBook.league[recordPeriod].alltime.slice().sort((a, b) => a.fpts - b.fpts).slice(0, 10),
			period_Top: masterRecordBook.league.totals.alltime[recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg).slice(0, 10),
			period_Low: masterRecordBook.league.totals.alltime[recordPeriod].slice().sort((a, b) => a.fptspg - b.fptspg).slice(0, 10),
			biggestBlowouts: masterRecordBook.league[recordPeriod].alltime.slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
			narrowestVictories: masterRecordBook.league[recordPeriod].alltime.slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
		};
		recordArrays.league.alltime[recordPeriod].managerBests = {
			week_Best: [],
			week_Worst: [],
			period_Best: [],
			period_Worst: [],
			blowout_Best: [],
			blowout_Worst: [],
			narrow_Best: [],
			narrow_Worst: [],
			epeRecords: masterRecordBook.league.grandTotals[recordPeriod].slice().sort((a, b) => b.epePerc - a.epePerc),
			medianRecords: masterRecordBook.league.grandTotals[recordPeriod].slice().sort((a, b) => b.medianPerc - a.medianPerc),
			cumulativePoints: masterRecordBook.league.grandTotals[recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg),
			winRecords: masterRecordBook.league.grandTotals[recordPeriod].slice().sort((a, b) => b.winPerc - a.winPerc),
		};
		recordArrays.league.alltime[recordPeriod].players = {
			week_Best: [],
			week_MissedBest: [],
			week_Top: masterRecordBook.players.league[recordPeriod].alltime.slice().filter(p => p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),
			week_MissedTop: masterRecordBook.players.league[recordPeriod].alltime.slice().filter(p => p.benched == true).sort((a, b) => b.benchPoints - a.benchPoints).slice(0, 10),
			period_Best: [],
			period_Top: masterRecordBook.players.league.totals.alltime[recordPeriod].slice().sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 10),	
		};
		for(const recordManID in masterRecordBook.players.managers[recordPeriod].alltime) {
			recordArrays.league.alltime[recordPeriod].players.week_Best.push(masterRecordBook.players.managers[recordPeriod].alltime[recordManID].slice().filter(p => p.benched == false).sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].players.week_MissedBest.push(masterRecordBook.players.managers[recordPeriod].alltime[recordManID].slice().filter(p => p.benched == true).sort((a, b) => b.benchPoints - a.benchPoints).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].players.period_Best.push(masterRecordBook.players.managers.totals.alltime[recordManID][recordPeriod].slice().sort((a, b) => b.playerPoints - a.playerPoints).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].managerBests.week_Best.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().sort((a, b) => b.fpts - a.fpts).slice(0, 1)[0]); 
			recordArrays.league.alltime[recordPeriod].managerBests.week_Worst.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().sort((a, b) => a.fpts - b.fpts).slice(0, 1)[0]); 
			recordArrays.league.alltime[recordPeriod].managerBests.period_Best.push(masterRecordBook.managers.totals.alltime[recordManID][recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg).slice(0, 1)[0]); 
			recordArrays.league.alltime[recordPeriod].managerBests.period_Worst.push(masterRecordBook.managers.totals.alltime[recordManID][recordPeriod].slice().sort((a, b) => a.fptspg - b.fptspg).slice(0, 1)[0]); 
			recordArrays.league.alltime[recordPeriod].managerBests.blowout_Best.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].managerBests.blowout_Worst.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].managerBests.narrow_Best.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 1)[0]);
			recordArrays.league.alltime[recordPeriod].managerBests.narrow_Worst.push(masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 1)[0]);
			if(!recordArrays.managers.alltime[recordPeriod][recordManID]) {		
				recordArrays.managers.alltime[recordPeriod][recordManID] = {
					week_Best: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().sort((a, b) => b.fpts - a.fpts).slice(0, 10),
					week_Worst: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().sort((a, b) => a.fpts - b.fpts).slice(0, 10),
					period_Best: masterRecordBook.managers.totals.alltime[recordManID][recordPeriod].slice().sort((a, b) => b.fptspg - a.fptspg).slice(0, 10),
					period_Worst: masterRecordBook.managers.totals.alltime[recordManID][recordPeriod].slice().sort((a, b) => a.fptspg - b.fptspg).slice(0, 10),
					blowout_Best: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
					blowout_Worst: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
					narrow_Best: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential >= 0).sort((a, b) => a.matchDifferential - b.matchDifferential).slice(0, 10),
					narrow_Worst: masterRecordBook.managers[recordPeriod].alltime[recordManID].slice().filter(v => v.matchDifferential <= 0).sort((a, b) => b.matchDifferential - a.matchDifferential).slice(0, 10),
				};
			}
		}
		recordArrays.league.alltime[recordPeriod].players.week_Best = recordArrays.league.alltime[recordPeriod].players.week_Best.sort((a, b) => b.playerPoints - a.playerPoints);
		recordArrays.league.alltime[recordPeriod].players.week_MissedBest = recordArrays.league.alltime[recordPeriod].players.week_MissedBest.sort((a, b) => b.benchPoints - a.benchPoints);
		recordArrays.league.alltime[recordPeriod].players.period_Best = recordArrays.league.alltime[recordPeriod].players.period_Best.sort((a, b) => b.playerPoints - a.playerPoints);
		recordArrays.league.alltime[recordPeriod].managerBests.week_Best = recordArrays.league.alltime[recordPeriod].managerBests.week_Best.sort((a, b) => b.fpts - a.fpts);	
		recordArrays.league.alltime[recordPeriod].managerBests.week_Worst = recordArrays.league.alltime[recordPeriod].managerBests.week_Worst.sort((a, b) => b.fpts - a.fpts);		
		recordArrays.league.alltime[recordPeriod].managerBests.period_Best = recordArrays.league.alltime[recordPeriod].managerBests.period_Best.sort((a, b) => b.fptspg - a.fptspg);
		recordArrays.league.alltime[recordPeriod].managerBests.period_Worst = recordArrays.league.alltime[recordPeriod].managerBests.period_Worst.sort((a, b) => b.fptspg - a.fptspg);
		recordArrays.league.alltime[recordPeriod].managerBests.blowout_Best = recordArrays.league.alltime[recordPeriod].managerBests.blowout_Best.sort((a, b) => b.matchDifferential - a.matchDifferential);
		recordArrays.league.alltime[recordPeriod].managerBests.blowout_Worst = recordArrays.league.alltime[recordPeriod].managerBests.blowout_Worst.sort((a, b) => a.matchDifferential - b.matchDifferential);
		recordArrays.league.alltime[recordPeriod].managerBests.narrow_Best = recordArrays.league.alltime[recordPeriod].managerBests.narrow_Best.sort((a, b) => a.matchDifferential - b.matchDifferential);
		recordArrays.league.alltime[recordPeriod].managerBests.narrow_Worst = recordArrays.league.alltime[recordPeriod].managerBests.narrow_Worst.sort((a, b) => b.matchDifferential - a.matchDifferential);
	}

	const recordsData = {
		seasonWeekRecords,
		leagueRosterRecords,
		leagueWeekRecords: recordArrays.league.alltime.regularSeason.week_Top,
		leagueRecordArrays: recordArrays.league.alltime,
		allManagers,
		currentYear,
		lastYear
	};

	// update localStorage
	localStorage.setItem("records", JSON.stringify(recordsData));

	records.update(() => recordsData);

	return recordsData;
}